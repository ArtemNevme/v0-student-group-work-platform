"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface UpdateProfileData {
  full_name?: string
  bio?: string
  major?: string
  year?: string
}

export async function updateProfile(data: UpdateProfileData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.full_name,
      bio: data.bio,
      major: data.major,
      year: data.year,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/profile")
  return { success: true }
}

export async function getProfileStats(userId: string) {
  const supabase = await createClient()

  // Get tasks completed
  const { count: tasksCompleted } = await supabase
    .from("task_assignments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "completed")

  // Get total tasks assigned
  const { count: totalTasks } = await supabase
    .from("task_assignments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)

  // Get groups joined
  const { count: groupsJoined } = await supabase
    .from("group_members")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)

  // Get assignments completed
  const { data: assignmentsData } = await supabase
    .from("assignments")
    .select("id, status, group_id")
    .eq("status", "completed")

  // Filter assignments where user is a member of the group
  const { data: userGroups } = await supabase.from("group_members").select("group_id").eq("user_id", userId)

  const userGroupIds = userGroups?.map((g) => g.group_id) || []
  const assignmentsCompleted = assignmentsData?.filter((a) => userGroupIds.includes(a.group_id)).length || 0

  // Get messages sent
  const { count: messagesSent } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_deleted", false)

  // Get activity history for heatmap (last 365 days)
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  const { data: taskActivity } = await supabase
    .from("task_assignments")
    .select("completed_at")
    .eq("user_id", userId)
    .eq("status", "completed")
    .gte("completed_at", oneYearAgo.toISOString())

  // Build activity map
  const activityMap: Record<string, number> = {}
  taskActivity?.forEach((task) => {
    if (task.completed_at) {
      const date = task.completed_at.split("T")[0]
      activityMap[date] = (activityMap[date] || 0) + 1
    }
  })

  return {
    tasksCompleted: tasksCompleted || 0,
    totalTasks: totalTasks || 0,
    groupsJoined: groupsJoined || 0,
    assignmentsCompleted,
    messagesSent: messagesSent || 0,
    activityMap,
  }
}
