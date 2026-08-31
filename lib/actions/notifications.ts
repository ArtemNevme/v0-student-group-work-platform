"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

const NOTIFICATION_TYPES = new Set([
  "message",
  "mention",
  "task",
  "deadline",
  "invitation",
  "achievement",
  "friend_request",
  "group_added",
])

export async function getMyNotifications() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    return { error: error.message }
  }

  return { notifications }
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function markAllNotificationsAsRead() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function createNotification(userId: string, type: string, title: string, message: string, link?: string) {
  if (!NOTIFICATION_TYPES.has(type)) {
    return { error: "Invalid notification type" }
  }
  if (!title.trim() || title.length > 160 || !message.trim() || message.length > 1000) {
    return { error: "Invalid notification content" }
  }
  if (link && (!link.startsWith("/") || link.startsWith("//"))) {
    return { error: "Invalid notification link" }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase.rpc("create_notification", {
    p_user_id: userId,
    p_type: type,
    p_title: title,
    p_message: message,
    p_link: link || null,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function getPendingInvitations() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Get user's email
  const { data: profile } = await supabase.from("profiles").select("email").eq("id", user.id).single()

  if (!profile) {
    return { error: "Profile not found" }
  }

  // Get pending invitations for this email
  const { data: invitations, error } = await supabase
    .from("invitations")
    .select(
      `
      *,
      groups (
        id,
        name,
        description,
        member_count,
        max_members
      ),
      profiles!invitations_invited_by_fkey (
        full_name
      )
    `,
    )
    .eq("invited_email", profile.email)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { invitations }
}
