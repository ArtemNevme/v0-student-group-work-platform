"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createNotification } from "./notifications"

export async function searchUsers(query: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  if (!query || query.trim().length < 3) {
    return { users: [] }
  }

  const normalizedQuery = query.trim()

  // Search for users by email or name, excluding current user
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url")
    .or(`email.ilike.%${normalizedQuery}%,full_name.ilike.%${normalizedQuery}%`)
    .neq("id", user.id)
    .limit(5)

  if (error) {
    return { error: error.message }
  }

  return { users: data }
}

export async function addFriend(friendId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Check if friendship already exists
  const { data: existing } = await supabase
    .from("friends")
    .select("*")
    .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
    .limit(1)
    .maybeSingle()

  if (existing) {
    return { error: "Friend request already exists" }
  }

  // A single directional row represents a friendship; readers query both
  // sides, so the recipient never needs an unauthorized reciprocal insert.
  const { error } = await supabase.from("friends").insert({
    user_id: user.id,
    friend_id: friendId,
    status: "accepted",
  })

  if (error) {
    return { error: error.message }
  }

  // Create notification for the friend
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single()

  await createNotification(
    friendId,
    "friend_request",
    "New Friend",
    `${profile?.full_name || "Someone"} added you as a friend`,
    "/dashboard/profile",
  )

  revalidatePath("/dashboard/profile")
  return { success: true }
}

export async function removeFriend(friendId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Delete both directions of the friendship
  await supabase
    .from("friends")
    .delete()
    .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)

  revalidatePath("/dashboard/profile")
  return { success: true }
}

export async function getMyFriends() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Get all friendships where the user is either participant.
  const { data, error } = await supabase
    .from("friends")
    .select("user_id, friend_id")
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
    .eq("status", "accepted")

  if (error) {
    return { error: error.message }
  }

  // Get friend profiles
  const friendIds = [...new Set(data.map((friendship) => (friendship.user_id === user.id ? friendship.friend_id : friendship.user_id)))]

  if (friendIds.length === 0) {
    return { friends: [] }
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url, points, level")
    .in("id", friendIds)

  if (profilesError) {
    return { error: profilesError.message }
  }

  return { friends: profiles }
}

export async function checkFriendship(friendId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { isFriend: false }
  }

  const { data } = await supabase
    .from("friends")
    .select("*")
    .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
    .eq("status", "accepted")
    .single()

  return { isFriend: !!data }
}
