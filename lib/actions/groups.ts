"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { nanoid } from "nanoid"
import { createNotification } from "./notifications"

export async function createGroup(data: {
  name: string
  description?: string
  category?: string
  max_members?: number
  subject_id?: string | null
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  if (!data.name) {
    return { error: "Group name is required" }
  }

  // Generate unique invite code
  const inviteCode = nanoid(10)

  // Create group
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .insert({
      name: data.name,
      description: data.description || null,
      category: data.category || "study",
      max_members: data.max_members || 10,
      subject_id: data.subject_id || null,
      created_by: user.id,
      invite_code: inviteCode,
    })
    .select()
    .single()

  if (groupError) {
    return { error: groupError.message }
  }

  // Add creator as admin member
  const { error: memberError } = await supabase.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
    role: "admin",
  })

  if (memberError) {
    return { error: memberError.message }
  }

  revalidatePath("/dashboard")
  return { success: true, group }
}

export async function getMyGroups() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("group_members")
    .select(
      `
      *,
      groups (
        id,
        name,
        description,
        category,
        member_count,
        created_at,
        subject_id,
        subjects (
          name,
          icon,
          color
        )
      )
    `,
    )
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { groups: data }
}

export async function getGroupDetails(groupId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Get group details
  const { data: group, error: groupError } = await supabase.from("groups").select("*").eq("id", groupId).single()

  if (groupError) {
    return { error: groupError.message }
  }

  // Get members
  const { data: members, error: membersError } = await supabase
    .from("group_members")
    .select(
      `
      *,
      profiles (
        id,
        full_name,
        email,
        avatar_url,
        points,
        level
      )
    `,
    )
    .eq("group_id", groupId)

  if (membersError) {
    return { error: membersError.message }
  }

  // Check if current user is member
  const isMember = members.some((m) => m.user_id === user.id)
  if (!isMember) {
    return { error: "You are not a member of this group" }
  }

  // Get current user's role
  const currentMember = members.find((m) => m.user_id === user.id)

  return { group, members, currentUserRole: currentMember?.role }
}

export async function inviteMember(groupId: string, email: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Check if user is member of the group
  const { data: membership } = await supabase
    .from("group_members")
    .select("*")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    return { error: "You are not a member of this group" }
  }
  if (membership.role !== "admin") {
    return { error: "Only group admins can invite members" }
  }

  const { data: group } = await supabase.from("groups").select("name").eq("id", groupId).single()

  if (!group) {
    return { error: "Group not found" }
  }

  // Check if already invited or member
  const { data: existingInvite } = await supabase
    .from("invitations")
    .select("*")
    .eq("group_id", groupId)
    .eq("invited_email", email)
    .eq("status", "pending")
    .single()

  if (existingInvite) {
    return { error: "User already invited" }
  }

  // Check if already a member
  const { data: profile } = await supabase.from("profiles").select("id").eq("email", email).single()

  if (profile) {
    const { data: existingMember } = await supabase
      .from("group_members")
      .select("*")
      .eq("group_id", groupId)
      .eq("user_id", profile.id)
      .single()

    if (existingMember) {
      return { error: "User is already a member" }
    }
  }

  // Generate invite code
  const inviteCode = nanoid(10)

  // Create invitation
  const { error } = await supabase.from("invitations").insert({
    group_id: groupId,
    invited_by: user.id,
    invited_email: email,
    invite_code: inviteCode,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
  })

  if (error) {
    return { error: error.message }
  }

  if (profile) {
    await createNotification(
      profile.id,
      "invitation",
      "Group Invitation",
      `You've been invited to join "${group.name}"`,
      `/invitations/${inviteCode}`,
    )
  }

  revalidatePath(`/dashboard/groups/${groupId}`)
  return { success: true, inviteCode }
}

export async function acceptInvitation(inviteCode: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data: invitation, error: inviteError } = await supabase
    .from("invitations")
    .select("*, groups(*)")
    .eq("invite_code", inviteCode)
    .maybeSingle()

  if (inviteError || !invitation) {
    return { error: "Invalid invitation code" }
  }

  if (invitation.status !== "pending") {
    return { error: "Invitation already used" }
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return { error: "Invitation expired" }
  }

  const { data: profile } = await supabase.from("profiles").select("email").eq("id", user.id).single()

  if (!profile?.email || profile.email.toLowerCase() !== invitation.invited_email.toLowerCase()) {
    return { error: "This invitation was issued for a different email address" }
  }

  // Check if already a member
  const { data: existingMember } = await supabase
    .from("group_members")
    .select("*")
    .eq("group_id", invitation.group_id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (existingMember) {
    return { error: "You are already a member of this group" }
  }

  // Check group member limit
  if (invitation.groups.member_count >= invitation.groups.max_members) {
    return { error: "Group is full" }
  }

  const { error: memberError } = await supabase.from("group_members").insert({
    group_id: invitation.group_id,
    user_id: user.id,
    role: "member",
  })

  if (memberError) {
    return { error: memberError.message }
  }

  // Update invitation status
  await supabase.from("invitations").update({ status: "accepted" }).eq("id", invitation.id)

  revalidatePath("/dashboard")
  return { success: true, groupId: invitation.group_id, groupName: invitation.groups.name }
}

export async function leaveGroup(groupId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data: members } = await supabase.from("group_members").select("*").eq("group_id", groupId)

  if (!members || members.length === 0) {
    return { error: "Group not found" }
  }

  const currentMember = members.find((m) => m.user_id === user.id)

  if (!currentMember) {
    return { error: "You are not a member of this group" }
  }

  // If user is the only member, delete the entire group
  if (members.length === 1) {
    // Delete the group (cascade will handle related records)
    const { error: deleteError } = await supabase.from("groups").delete().eq("id", groupId)

    if (deleteError) {
      return { error: deleteError.message }
    }

    revalidatePath("/dashboard")
    return { success: true, deletedGroup: true }
  }

  // If user is admin and the only admin, promote another member to admin
  const admins = members.filter((m) => m.role === "admin")

  if (currentMember.role === "admin" && admins.length === 1) {
    // Find the next member to promote (oldest member by join date)
    const nextAdmin = members
      .filter((m) => m.user_id !== user.id)
      .sort((a, b) => new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime())[0]

    if (nextAdmin) {
      // Promote the next member to admin
      const { error: promoteError } = await supabase
        .from("group_members")
        .update({ role: "admin" })
        .eq("id", nextAdmin.id)

      if (promoteError) {
        return { error: "Failed to promote new admin: " + promoteError.message }
      }
    }
  }

  // Remove user from group
  const { error } = await supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function removeMember(groupId: string, userId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Check if current user is member of the group
  const { data: membership } = await supabase
    .from("group_members")
    .select("*")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    return { error: "You are not a member of this group" }
  }
  if (membership.role !== "admin") {
    return { error: "Only group admins can remove members" }
  }

  // Remove member
  const { error } = await supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/groups/${groupId}`)
  return { success: true }
}

export async function addFriendToGroup(groupId: string, friendId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Check if current user is member of the group
  const { data: membership } = await supabase
    .from("group_members")
    .select("*")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    return { error: "You are not a member of this group" }
  }
  if (membership.role !== "admin") {
    return { error: "Only group admins can add friends to a group" }
  }

  // Check if they are friends
  const { data: friendship } = await supabase
    .from("friends")
    .select("*")
    .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
    .eq("status", "accepted")
    .single()

  if (!friendship) {
    return { error: "You can only add friends to groups" }
  }

  // Check if friend is already a member
  const { data: existingMember } = await supabase
    .from("group_members")
    .select("*")
    .eq("group_id", groupId)
    .eq("user_id", friendId)
    .single()

  if (existingMember) {
    return { error: "User is already a member" }
  }

  // Check group member limit
  const { data: group } = await supabase.from("groups").select("member_count, max_members").eq("id", groupId).single()

  if (group && group.member_count >= group.max_members) {
    return { error: "Group is full" }
  }

  // Add friend to group directly
  const { error } = await supabase.from("group_members").insert({
    group_id: groupId,
    user_id: friendId,
    role: "member",
  })

  if (error) {
    return { error: error.message }
  }

  // Create notification for the friend
  const { data: groupData } = await supabase.from("groups").select("name").eq("id", groupId).single()
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single()

  await createNotification(
    friendId,
    "group_added",
    "Added to Group",
    `${profile?.full_name || "Someone"} added you to "${groupData?.name || "a group"}"`,
    `/dashboard/groups/${groupId}`,
  )

  revalidatePath(`/dashboard/groups/${groupId}`)
  return { success: true }
}
