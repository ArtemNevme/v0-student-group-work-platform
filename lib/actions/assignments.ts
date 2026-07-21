"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

interface CreateAssignmentOptions {
  groupId: string
  title: string
  description?: string
  deadline: string
  priority?: "low" | "medium" | "high" | "urgent"
  estimatedHours?: number | null
  links?: string[]
  planningMethod?: "ai" | "manual" | "later"
}

export async function createAssignmentWithOptions(options: CreateAssignmentOptions) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const {
    groupId,
    title,
    description,
    deadline,
    priority = "medium",
    estimatedHours,
    links = [],
    planningMethod = "later",
  } = options

  if (!groupId || !title || !deadline) {
    return { error: "Missing required fields" }
  }

  // Verify user is member of the group
  const { data: membership } = await supabase
    .from("group_members")
    .select("*")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    return { error: "You are not a member of this group" }
  }

  const { data: assignment, error } = await supabase
    .from("assignments")
    .insert({
      group_id: groupId,
      title,
      description: description || null,
      deadline,
      priority,
      estimated_hours: estimatedHours,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Add links as sources if any
  if (links.length > 0) {
    const linksData = links.map((url) => ({
      assignment_id: assignment.id,
      url,
      title: url, // Use URL as title initially
      created_by: user.id,
    }))

    await supabase.from("assignment_links").insert(linksData)
  }

  revalidatePath("/dashboard/my-tasks")
  revalidatePath(`/dashboard/groups/${groupId}`)

  return {
    success: true,
    assignmentId: assignment.id,
    planningMethod,
  }
}

export async function createAssignment(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const groupId = formData.get("groupId") as string
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const deadline = formData.get("deadline") as string

  if (!groupId || !title || !deadline) {
    return { error: "Missing required fields" }
  }

  // Verify user is member of the group
  const { data: membership } = await supabase
    .from("group_members")
    .select("*")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    return { error: "You are not a member of this group" }
  }

  const { data: assignment, error } = await supabase
    .from("assignments")
    .insert({
      group_id: groupId,
      title,
      description,
      deadline,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/my-tasks")
  revalidatePath(`/dashboard/groups/${groupId}`)
  return { success: true, assignmentId: assignment.id }
}

export async function getMyAssignments() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated", assignments: [] }
  }

  const { data: memberships, error: membershipError } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", user.id)

  if (membershipError) {
    return { error: membershipError.message, assignments: [] }
  }

  const groupIds = memberships?.map((m) => m.group_id) || []

  // If user is not in any groups, return empty array
  if (groupIds.length === 0) {
    return { assignments: [] }
  }

  // Get all assignments from those groups
  const { data, error } = await supabase
    .from("assignments")
    .select(
      `
      *,
      groups (
        id,
        name
      ),
      profiles!assignments_created_by_fkey (
        full_name
      )
    `,
    )
    .in("group_id", groupIds)
    .order("deadline", { ascending: true })

  if (error) {
    return { error: error.message, assignments: [] }
  }

  return { assignments: data || [] }
}

export async function getGroupAssignments(groupId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Verify user is member of the group
  const { data: membership } = await supabase
    .from("group_members")
    .select("*")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    return { error: "You are not a member of this group" }
  }

  const { data, error } = await supabase
    .from("assignments")
    .select(
      `
      *,
      groups (
        id,
        name
      ),
      profiles!assignments_created_by_fkey (
        full_name
      )
    `,
    )
    .eq("group_id", groupId)
    .order("deadline", { ascending: true })

  if (error) {
    return { error: error.message }
  }

  return { assignments: data }
}

export async function getAssignmentDetails(assignmentId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Get assignment
  const { data: assignment, error: assignmentError } = await supabase
    .from("assignments")
    .select(
      `
      *,
      groups (
        id,
        name
      ),
      profiles!assignments_created_by_fkey (
        full_name
      )
    `,
    )
    .eq("id", assignmentId)
    .single()

  if (assignmentError) {
    return { error: assignmentError.message }
  }

  if (assignment.group_id) {
    const { data: membership } = await supabase
      .from("group_members")
      .select("*")
      .eq("group_id", assignment.group_id)
      .eq("user_id", user.id)
      .single()

    if (!membership) {
      return { error: "You are not a member of this group" }
    }
  }

  // Get tasks for this assignment
  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select(
      `
      *,
      task_assignments (
        *,
        profiles (
          id,
          full_name,
          avatar_url
        )
      )
    `,
    )
    .eq("assignment_id", assignmentId)
    .order("order_index", { ascending: true })

  if (tasksError) {
    return { error: tasksError.message }
  }

  return { assignment, tasks }
}

export async function updateAssignment(assignmentId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const deadline = formData.get("deadline") as string
  const status = formData.get("status") as string

  // Get assignment to verify permissions
  const { data: assignment } = await supabase.from("assignments").select("*").eq("id", assignmentId).single()

  if (!assignment) {
    return { error: "Assignment not found" }
  }

  if (assignment.group_id) {
    const { data: membership } = await supabase
      .from("group_members")
      .select("*")
      .eq("group_id", assignment.group_id)
      .eq("user_id", user.id)
      .single()

    if (!membership) {
      return { error: "You are not a member of this group" }
    }
  }

  const { error } = await supabase
    .from("assignments")
    .update({
      title,
      description,
      deadline,
      status,
    })
    .eq("id", assignmentId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/my-tasks")
  revalidatePath(`/dashboard/assignments/${assignmentId}`)
  if (assignment.group_id) {
    revalidatePath(`/dashboard/groups/${assignment.group_id}`)
  }
  return { success: true }
}

export async function deleteAssignment(assignmentId: string) {
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

  // Only creator can delete
  if (assignment.created_by !== user.id) {
    return { error: "Only the creator can delete this assignment" }
  }

  // Delete assignment (cascades to tasks and task_assignments)
  const { error } = await supabase.from("assignments").delete().eq("id", assignmentId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/my-tasks")
  revalidatePath(`/dashboard/groups/${assignment.group_id}`)
  return { success: true }
}

export async function deleteAssignmentAndRedirect(assignmentId: string) {
  const result = await deleteAssignment(assignmentId)

  if (result.error) {
    return result
  }

  redirect("/dashboard/my-tasks")
}

export async function updateWorkLink(assignmentId: string, workLink: string) {
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

  if (assignment.group_id) {
    const { data: membership } = await supabase
      .from("group_members")
      .select("*")
      .eq("group_id", assignment.group_id)
      .eq("user_id", user.id)
      .single()

    if (!membership) {
      return { error: "You are not a member of this group" }
    }
  }

  // Update work link
  const { error } = await supabase.from("assignments").update({ work_link: workLink }).eq("id", assignmentId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/assignments/${assignmentId}`)
  return { success: true }
}

export async function completeAssignment(assignmentId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Get assignment to verify permissions
  const { data: assignment } = await supabase
    .from("assignments")
    .select("*, groups(id)")
    .eq("id", assignmentId)
    .single()

  if (!assignment) {
    return { error: "Assignment not found" }
  }

  if (assignment.group_id) {
    const { data: membership } = await supabase
      .from("group_members")
      .select("*")
      .eq("group_id", assignment.group_id)
      .eq("user_id", user.id)
      .single()

    if (!membership) {
      return { error: "You are not a member of this group" }
    }
  }

  // Update assignment status to completed
  const { error } = await supabase.from("assignments").update({ status: "completed" }).eq("id", assignmentId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/my-tasks")
  revalidatePath(`/dashboard/assignments/${assignmentId}`)
  if (assignment.group_id) {
    revalidatePath(`/dashboard/groups/${assignment.group_id}`)
  }
  return { success: true }
}

export async function checkAllTasksCompleted(assignmentId: string) {
  const supabase = await createClient()

  const { data: tasks } = await supabase.from("tasks").select("id, status").eq("assignment_id", assignmentId)

  if (!tasks || tasks.length === 0) {
    return { allCompleted: false, totalTasks: 0, completedTasks: 0 }
  }

  const completedTasks = tasks.filter((t) => t.status === "completed").length
  const allCompleted = completedTasks === tasks.length

  return {
    allCompleted,
    totalTasks: tasks.length,
    completedTasks,
  }
}

export async function getMyStudyTeams(subjectId?: string | null) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated", teams: [] }
  }

  // Get groups where user is a member
  const { data: memberships } = await supabase.from("group_members").select("group_id").eq("user_id", user.id)

  if (!memberships || memberships.length === 0) {
    return { teams: [] }
  }

  const groupIds = memberships.map((m) => m.group_id)

  let query = supabase.from("groups").select("id, name, subject_id, subjects(name)").in("id", groupIds).order("name")

  // Filter by subject if provided
  if (subjectId) {
    query = query.eq("subject_id", subjectId)
  }

  const { data: teams, error } = await query

  if (error) {
    return { error: error.message, teams: [] }
  }

  return { teams: teams || [] }
}

export async function addAssignmentToTeam(assignmentId: string, teamId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Verify user is member of the team
  const { data: membership } = await supabase
    .from("group_members")
    .select("*")
    .eq("group_id", teamId)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    return { error: "You are not a member of this team" }
  }

  // Update assignment to add group_id
  const { error } = await supabase.from("assignments").update({ group_id: teamId }).eq("id", assignmentId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/assignments/${assignmentId}`)
  revalidatePath(`/dashboard/groups/${teamId}`)
  revalidatePath("/dashboard/my-tasks")

  return { success: true }
}
