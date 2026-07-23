"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createNotification } from "./notifications"

export async function sendMessage(groupId: string, content: string, assignmentId?: string, replyToId?: string) {
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
    return { error: "Not authorized" }
  }

  // Send message
  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      group_id: groupId,
      assignment_id: assignmentId || null,
      user_id: user.id,
      content,
      reply_to_id: replyToId || null,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Extract mentions from content
  const mentions = content.match(/@[\w\s]+/g) || []

  // Get user profile for notification message
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single()

  // Create notifications for other group members
  const { data: members } = await supabase
    .from("group_members")
    .select("user_id, profiles(full_name)")
    .eq("group_id", groupId)

  if (members) {
    const notifications = members
      .filter((m) => m.user_id !== user.id)
      .map((m) => {
        // Check if this user was mentioned
        const wasMentioned = mentions.some((mention) =>
          mention.toLowerCase().includes((m.profiles as any)?.full_name?.toLowerCase() || ""),
        )

        return {
          user_id: m.user_id,
          type: wasMentioned ? "mention" : "message",
          title: wasMentioned ? "You were mentioned" : "New message",
          message: wasMentioned
            ? `${profile?.full_name || "Someone"} mentioned you in group chat`
            : `${profile?.full_name || "Someone"}: ${content.substring(0, 50)}${content.length > 50 ? "..." : ""}`,
          link: `/dashboard/groups/${groupId}`,
        }
      })

    await Promise.all(
      notifications.map((notification) =>
        createNotification(notification.user_id, notification.type, notification.title, notification.message, notification.link),
      ),
    )
  }

  revalidatePath(`/dashboard/groups/${groupId}`)
  return { success: true, message }
}

export async function editMessage(messageId: string, content: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("messages")
    .update({
      content,
      is_edited: true,
    })
    .eq("id", messageId)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    console.log("[v0] Edit message error:", error.message)
    return { error: error.message }
  }

  return { success: true, message: data }
}

export async function deleteMessage(messageId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("messages")
    .update({ is_deleted: true })
    .eq("id", messageId)
    .eq("user_id", user.id)

  if (error) {
    console.log("[v0] Delete message error:", error.message)
    return { error: error.message }
  }

  return { success: true }
}

export async function addReaction(messageId: string, emoji: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("message_reactions")
    .insert({
      message_id: messageId,
      user_id: user.id,
      emoji,
    })
    .select()
    .single()

  if (error) {
    // Might be duplicate, ignore
    if (error.code === "23505") {
      return { success: true }
    }
    return { error: error.message }
  }

  return { success: true, reaction: data }
}

export async function removeReaction(reactionId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase.from("message_reactions").delete().eq("id", reactionId).eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function getGroupMessages(groupId: string) {
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
    return { error: "Not authorized" }
  }

  const { data: messages, error } = await supabase
    .from("messages")
    .select(`
      *,
      profiles (id, full_name, avatar_url),
      reply_to:reply_to_id (
        id, content, user_id,
        profiles (id, full_name)
      ),
      reactions:message_reactions (
        id, emoji, user_id,
        profiles (id, full_name)
      )
    `)
    .eq("group_id", groupId)
    .is("assignment_id", null)
    .order("created_at", { ascending: true })

  if (error) {
    return { error: error.message }
  }

  return { messages }
}
