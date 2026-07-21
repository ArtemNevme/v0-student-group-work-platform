"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function searchUsers(query: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Search for users by email or name, excluding current user
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url")
    .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
    .neq("id", user.id)
    .limit(10)

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
    .single()

  if (existing) {
    return { error: "Friend request already exists" }
  }

  // Create friendship (automatically accepted for simplicity)
  const { error } = await supabase.from("friends").insert({
    user_id: user.id,
    friend_id: friendId,
    status: "accepted",
  })

  if (error) {
    return { error: error.message }
  }

  // Create reciprocal friendship
  await supabase.from("friends").insert({
    user_id: friendId,
    friend_id: user.id,
    status: "accepted",
  })

  // Create notification for the friend
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single()

  await supabase.from("notifications").insert({
    user_id: friendId,
    type: "friend_request",
    title: "New Friend",
    message: `${profile?.full_name || "Someone"} added you as a friend`,
    link: "/dashboard/profile",
  })

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

  // Get all friendships where user is involved
  const { data, error } = await supabase.from("friends").select("*").eq("user_id", user.id).eq("status", "accepted")

  if (error) {
    return { error: error.message }
  }

  // Get friend profiles
  const friendIds = data.map((f) => f.friend_id)

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
    .eq("user_id", user.id)
    .eq("friend_id", friendId)
    .eq("status", "accepted")
    .single()

  return { isFriend: !!data }
}
