"use server"

import { createClient } from "@/lib/supabase/server"

export interface SearchResult {
  id: string
  type: "task" | "assignment" | "group" | "member"
  title: string
  subtitle?: string
  url: string
  icon?: string
}

interface AssignmentRow {
  id: string
  title: string
  status: string
  group: {
    name: string
  } | null
}

interface MemberRow {
  user_id: string
  profile: {
    id: string
    full_name: string | null
    email: string | null
  } | null
  group: {
    name: string
  } | null
}

interface TaskAssignmentRow {
  id: string
  status: string
  task: {
    id: string
    title: string
    assignment: {
      id: string
      title: string
    } | null
  } | null
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) {
    return []
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const searchQuery = `%${query.toLowerCase()}%`
  const results: SearchResult[] = []

  // Get user's groups for filtering
  const { data: userGroups } = await supabase.from("group_members").select("group_id").eq("user_id", user.id)

  const groupIds = userGroups?.map((g) => g.group_id) || []

  // Search tasks assigned to user
  const { data: rawTasks } = await supabase
    .from("task_assignments")
    .select(`
      id,
      status,
      task:tasks (
        id,
        title,
        assignment:assignments (
          id,
          title
        )
      )
    `)
    .eq("user_id", user.id)
    .ilike("task.title", searchQuery)
    .limit(5)

  const tasks = rawTasks as TaskAssignmentRow[] | null

  tasks?.forEach((t) => {
    if (t.task?.title) {
      results.push({
        id: t.task.id,
        type: "task",
        title: t.task.title,
        subtitle: t.task.assignment?.title || "Task",
        url: `/dashboard/assignments/${t.task.assignment?.id}`,
        icon: t.status === "completed" ? "check-circle" : "circle",
      })
    }
  })

  // Search assignments in user's groups
  if (groupIds.length > 0) {
    const { data: rawAssignments } = await supabase
      .from("assignments")
      .select(`
        id,
        title,
        status,
        group:groups (
          name
        )
      `)
      .in("group_id", groupIds)
      .ilike("title", searchQuery)
      .limit(5)

    const assignments = rawAssignments as AssignmentRow[] | null

    assignments?.forEach((a) => {
      results.push({
        id: a.id,
        type: "assignment",
        title: a.title,
        subtitle: a.group?.name || "Assignment",
        url: `/dashboard/assignments/${a.id}`,
        icon: a.status === "completed" ? "check-circle" : "file-text",
      })
    })
  }

  // Search groups
  if (groupIds.length > 0) {
    const { data: groups } = await supabase
      .from("groups")
      .select("id, name, description")
      .in("id", groupIds)
      .ilike("name", searchQuery)
      .limit(5)

    groups?.forEach((g) => {
      results.push({
        id: g.id,
        type: "group",
        title: g.name,
        subtitle: g.description || "Group",
        url: `/dashboard/groups/${g.id}`,
        icon: "users",
      })
    })
  }

  // Search group members
  if (groupIds.length > 0) {
    const { data: rawMembers } = await supabase
      .from("group_members")
      .select(`
        user_id,
        profile:profiles (
          id,
          full_name,
          email
        ),
        group:groups (
          name
        )
      `)
      .in("group_id", groupIds)
      .limit(10)

    const members = rawMembers as MemberRow[] | null

    members?.forEach((m) => {
      if (
        m.profile?.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        m.profile?.email?.toLowerCase().includes(query.toLowerCase())
      ) {
        // Avoid duplicates
        if (!results.find((r) => r.type === "member" && r.id === m.profile?.id)) {
          results.push({
            id: m.profile?.id || "",
            type: "member",
            title: m.profile?.full_name || "User",
            subtitle: m.group?.name || "Member",
            url: `/dashboard/groups`,
            icon: "user",
          })
        }
      }
    })
  }

  return results.slice(0, 15)
}

export async function getRecentItems(): Promise<SearchResult[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const results: SearchResult[] = []

  // Get user's groups
  const { data: userGroups } = await supabase.from("group_members").select("group_id").eq("user_id", user.id)

  const groupIds = userGroups?.map((g) => g.group_id) || []

  // Recent assignments
  if (groupIds.length > 0) {
    const { data: rawRecentAssignments } = await supabase
      .from("assignments")
      .select(`
        id,
        title,
        status,
        group:groups (name)
      `)
      .in("group_id", groupIds)
      .order("created_at", { ascending: false })
      .limit(3)

    const recentAssignments = rawRecentAssignments as AssignmentRow[] | null

    recentAssignments?.forEach((a) => {
      results.push({
        id: a.id,
        type: "assignment",
        title: a.title,
        subtitle: a.group?.name || "Assignment",
        url: `/dashboard/assignments/${a.id}`,
        icon: "file-text",
      })
    })
  }

  // Recent groups
  if (groupIds.length > 0) {
    const { data: recentGroups } = await supabase
      .from("groups")
      .select("id, name")
      .in("id", groupIds)
      .order("created_at", { ascending: false })
      .limit(3)

    recentGroups?.forEach((g) => {
      results.push({
        id: g.id,
        type: "group",
        title: g.name,
        subtitle: "Group",
        url: `/dashboard/groups/${g.id}`,
        icon: "users",
      })
    })
  }

  return results
}
