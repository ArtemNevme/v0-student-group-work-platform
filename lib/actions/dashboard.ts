"use server"

import { createClient } from "@/lib/supabase/server"

export async function getDashboardStats() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { stats: null, error: "Not authenticated" }
  }

  try {
    // Get total groups
    const { count: groupCount } = await supabase
      .from("group_members")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    // Get pending tasks (assigned to user and not completed)
    const { count: pendingTaskCount } = await supabase
      .from("task_assignments")
      .select("*, tasks!inner(*)", { count: "exact", head: true })
      .eq("user_id", user.id)
      .neq("status", "completed")

    // Get upcoming deadlines (assignments due in next 7 days)
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    const { data: upcomingAssignments } = await supabase
      .from("assignments")
      .select("*, groups(*, group_members!inner(user_id))")
      .eq("groups.group_members.user_id", user.id)
      .gte("deadline", new Date().toISOString())
      .lte("deadline", sevenDaysFromNow.toISOString())
      .order("deadline", { ascending: true })

    const totalUpcomingDeadlines = upcomingAssignments?.length || 0

    // Get user profile for points and level
    const { data: profile } = await supabase.from("profiles").select("points, level").eq("id", user.id).single()

    return {
      stats: {
        totalGroups: groupCount || 0,
        pendingTasks: pendingTaskCount || 0,
        upcomingDeadlines: totalUpcomingDeadlines,
        points: profile?.points || 0,
        level: profile?.level || 1,
      },
      error: null,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return { stats: null, error: "Failed to fetch dashboard statistics" }
  }
}

export async function getUpcomingDeadlines() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { deadlines: null, error: "Not authenticated" }
  }

  try {
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    const { data: assignments, error } = await supabase
      .from("assignments")
      .select("*, groups(id, name, group_members!inner(user_id)), subjects(name)")
      .eq("groups.group_members.user_id", user.id)
      .gte("deadline", new Date().toISOString())
      .lte("deadline", sevenDaysFromNow.toISOString())
      .order("deadline", { ascending: true })
      .limit(5)

    if (error) throw error

    const allDeadlines = (assignments || []).map((a) => ({
      id: a.id,
      title: a.title,
      deadline: a.deadline,
      status: a.status,
      groups: a.groups,
      subject: a.subjects?.name,
      source: "studysync" as const,
      alternate_link: null,
    }))

    return { deadlines: allDeadlines, error: null }
  } catch (error) {
    console.error("Error fetching upcoming deadlines:", error)
    return { deadlines: null, error: "Failed to fetch upcoming deadlines" }
  }
}

export async function getMyTasks() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { tasks: null, error: "Not authenticated" }
  }

  try {
    const { data: taskAssignments, error } = await supabase
      .from("task_assignments")
      .select(`
        *,
        tasks!inner(
          *,
          assignments!inner(
            id,
            title,
            deadline,
            status,
            groups!inner(id, name)
          )
        )
      `)
      .eq("user_id", user.id)
      .neq("status", "completed")
      .order("created_at", { ascending: false })

    if (error) throw error

    const now = new Date()
    const filteredTasks = taskAssignments?.filter((t) => {
      // Skip completed assignments
      if (t.tasks.assignments.status === "completed") return false

      const deadline = new Date(t.tasks.assignments.deadline)
      const daysSinceDeadline = (now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24)

      // Keep tasks that are not overdue by more than 7 days
      return daysSinceDeadline <= 7
    })

    return { tasks: filteredTasks, error: null }
  } catch (error) {
    console.error("Error fetching my tasks:", error)
    return { tasks: null, error: "Failed to fetch your tasks" }
  }
}

export async function getRecentActivity() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { activities: null, error: "Not authenticated" }
  }

  try {
    // Get recent notifications as activity feed
    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) throw error

    return { activities: notifications, error: null }
  } catch (error) {
    console.error("Error fetching recent activity:", error)
    return { activities: null, error: "Failed to fetch recent activity" }
  }
}
