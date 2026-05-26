"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { awardPoints } from "./gamification"
import { createNotification } from "./notifications"

interface TaskInput {
  title: string
  description: string
  estimatedHours: number
  assignedMemberId: string
}

async function updateAssignmentStatusBasedOnTasks(assignmentId: string) {
  const supabase = await createClient()

  // Get all tasks for this assignment
  const { data: tasks } = await supabase.from("tasks").select("id, status").eq("assignment_id", assignmentId)

  if (!tasks || tasks.length === 0) {
    return { updated: false }
  }

  // Get current assignment status
  const { data: assignment } = await supabase.from("assignments").select("status").eq("id", assignmentId).single()

  if (!assignment) {
    return { updated: false }
  }

  const completedCount = tasks.filter((t) => t.status === "completed").length
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length
  const totalCount = tasks.length

  let newStatus = assignment.status

  // Determine the new status
  if (completedCount === totalCount) {
    // All tasks completed - but don't auto-complete, let user confirm
    // Just keep it at in_progress until user manually completes
    newStatus = "in_progress"
  } else if (completedCount > 0 || inProgressCount > 0) {
    // At least one task started or completed
    newStatus = "in_progress"
  } else {
    // No tasks started
    newStatus = "not_started"
  }

  // Only update if status changed and assignment is not already completed
  if (newStatus !== assignment.status && assignment.status !== "completed") {
    await supabase.from("assignments").update({ status: newStatus }).eq("id", assignmentId)

    return { updated: true, newStatus }
  }

  return { updated: false }
}

export async function saveWorkPlan(assignmentId: string, tasks: TaskInput[]) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Get assignment to verify permissions
  const { data: assignment } = await supabase.from("assignments").select("*").eq("id", assignmentId).single()

  if (!assignment) {
    return { error: "Assignment not found" }
  }

  // Verify user is member of the group
  const { data: membership } = await supabase
    .from("group_members")
    .select("*")
    .eq("group_id", assignment.group_id)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    return { error: "Not authorized" }
  }

  // Delete existing tasks for this assignment
  await supabase.from("tasks").delete().eq("assignment_id", assignmentId)

  // Create new tasks
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]

    // Insert task
    const { data: newTask, error: taskError } = await supabase
      .from("tasks")
      .insert({
        assignment_id: assignmentId,
        title: task.title,
        description: task.description,
        estimated_hours: task.estimatedHours,
        order_index: i,
      })
      .select()
      .single()

    if (taskError || !newTask) {
      return { error: "Failed to create task" }
    }

    // Assign task to member
    const { error: assignError } = await supabase.from("task_assignments").insert({
      task_id: newTask.id,
      user_id: task.assignedMemberId,
    })

    if (assignError) {
      return { error: "Failed to assign task" }
    }

    await createNotification(
      task.assignedMemberId,
      "task",
      "New Task Assigned",
      `You've been assigned: ${task.title}`,
      `/dashboard/assignments/${assignmentId}`,
    )
  }

  await updateAssignmentStatusBasedOnTasks(assignmentId)

  revalidatePath(`/dashboard/assignments/${assignmentId}`)
  return { success: true }
}

export async function updateTaskStatus(taskId: string, status: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Get task assignment
  const { data: taskAssignment } = await supabase
    .from("task_assignments")
    .select("*, tasks(*, assignments(id, deadline, status, group_id))")
    .eq("task_id", taskId)
    .eq("user_id", user.id)
    .single()

  if (!taskAssignment) {
    return { error: "Not authorized to update this task" }
  }

  // Update task assignment status
  const { error } = await supabase
    .from("task_assignments")
    .update({
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    })
    .eq("id", taskAssignment.id)

  if (error) {
    return { error: error.message }
  }

  // Update task status
  await supabase.from("tasks").update({ status }).eq("id", taskId)

  if (status === "completed" && taskAssignment.tasks?.assignments?.deadline) {
    const deadline = new Date(taskAssignment.tasks.assignments.deadline)
    const now = new Date()
    const isEarly = now < deadline

    // Award points based on completion time
    const points = isEarly ? 75 : 50
    await awardPoints(user.id, points, `Completed task: ${taskAssignment.tasks.title}`)
  }

  const assignmentId = taskAssignment.tasks?.assignment_id

  if (assignmentId) {
    await updateAssignmentStatusBasedOnTasks(assignmentId)

    // Check if all tasks are now completed
    const { data: allTasks } = await supabase.from("tasks").select("id, status").eq("assignment_id", assignmentId)

    if (allTasks) {
      const completedCount = allTasks.filter((t) => t.status === "completed").length
      const totalCount = allTasks.length
      const allCompleted = completedCount === totalCount
      const assignmentStatus = taskAssignment.tasks?.assignments?.status

      revalidatePath(`/dashboard/assignments`)
      revalidatePath(`/dashboard/assignments/${assignmentId}`)
      revalidatePath(`/dashboard`)

      return {
        success: true,
        allTasksCompleted: allCompleted,
        completedCount,
        totalCount,
        assignmentId,
        assignmentAlreadyCompleted: assignmentStatus === "completed",
      }
    }
  }

  revalidatePath(`/dashboard/assignments`)
  revalidatePath(`/dashboard`)
  return { success: true }
}

export async function createTask(
  assignmentId: string,
  title: string,
  description: string,
  estimatedHours: number,
  assignedMemberId: string,
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Verify user is member of the group
  const { data: assignment } = await supabase
    .from("assignments")
    .select("*, groups!inner(group_members!inner(user_id))")
    .eq("id", assignmentId)
    .single()

  if (!assignment) {
    return { error: "Assignment not found" }
  }

  // Get current max order
  const { data: tasks } = await supabase
    .from("tasks")
    .select("order_index")
    .eq("assignment_id", assignmentId)
    .order("order_index", { ascending: false })
    .limit(1)

  const nextOrder = tasks && tasks.length > 0 ? (tasks[0].order_index || 0) + 1 : 0

  // Create task
  const { data: newTask, error: taskError } = await supabase
    .from("tasks")
    .insert({
      assignment_id: assignmentId,
      title,
      description,
      estimated_hours: estimatedHours,
      order_index: nextOrder,
      status: "not_started",
    })
    .select()
    .single()

  if (taskError || !newTask) {
    return { error: "Failed to create task" }
  }

  // Assign task to member
  const { error: assignError } = await supabase.from("task_assignments").insert({
    task_id: newTask.id,
    user_id: assignedMemberId,
    status: "not_started",
  })

  if (assignError) {
    return { error: "Failed to assign task" }
  }

  // Create notification
  await createNotification(
    assignedMemberId,
    "task",
    "New Task Assigned",
    `You've been assigned: ${title}`,
    `/dashboard/assignments/${assignmentId}`,
  )

  await updateAssignmentStatusBasedOnTasks(assignmentId)

  revalidatePath(`/dashboard/assignments/${assignmentId}`)
  return { success: true, task: newTask }
}

export async function updateTask(
  taskId: string,
  title: string,
  description: string,
  estimatedHours: number,
  assignedMemberId: string,
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Update task
  const { error: taskError } = await supabase
    .from("tasks")
    .update({
      title,
      description,
      estimated_hours: estimatedHours,
    })
    .eq("id", taskId)

  if (taskError) {
    return { error: "Failed to update task" }
  }

  // Update task assignment
  const { data: currentAssignment } = await supabase
    .from("task_assignments")
    .select("user_id")
    .eq("task_id", taskId)
    .single()

  if (currentAssignment && currentAssignment.user_id !== assignedMemberId) {
    // Delete old assignment
    await supabase.from("task_assignments").delete().eq("task_id", taskId)

    // Create new assignment
    await supabase.from("task_assignments").insert({
      task_id: taskId,
      user_id: assignedMemberId,
      status: "not_started",
    })

    // Notify new assignee
    await createNotification(
      assignedMemberId,
      "task",
      "Task Reassigned",
      `You've been assigned: ${title}`,
      `/dashboard/assignments`,
    )
  }

  revalidatePath(`/dashboard/assignments`)
  return { success: true }
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Get assignment ID before deleting
  const { data: task } = await supabase.from("tasks").select("assignment_id").eq("id", taskId).single()

  // Delete task (cascade will delete task_assignments)
  const { error } = await supabase.from("tasks").delete().eq("id", taskId)

  if (error) {
    return { error: "Failed to delete task" }
  }

  if (task?.assignment_id) {
    await updateAssignmentStatusBasedOnTasks(task.assignment_id)
  }

  revalidatePath(`/dashboard/assignments`)
  return { success: true }
}
