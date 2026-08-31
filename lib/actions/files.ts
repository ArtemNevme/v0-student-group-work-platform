"use server"

import { del } from "@vercel/blob"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

async function canAccessAssignment(assignmentId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, user: null, allowed: false }
  }

  const { data: assignment } = await supabase
    .from("assignments")
    .select("group_id, created_by")
    .eq("id", assignmentId)
    .maybeSingle()

  if (!assignment) {
    return { supabase, user, allowed: false }
  }

  if (assignment.created_by === user.id) {
    return { supabase, user, allowed: true }
  }

  if (!assignment.group_id) {
    return { supabase, user, allowed: false }
  }

  const { data: membership } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", assignment.group_id)
    .eq("user_id", user.id)
    .maybeSingle()

  return { supabase, user, allowed: Boolean(membership) }
}

export async function getAssignmentFiles(assignmentId: string) {
  const { supabase, user, allowed } = await canAccessAssignment(assignmentId)
  if (!user) {
    return { error: "Not authenticated", files: [] }
  }
  if (!allowed) {
    return { error: "Not authorized", files: [] }
  }

  const { data, error } = await supabase
    .from("assignment_files")
    .select("*")
    .eq("assignment_id", assignmentId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching files:", error)
    return { files: [] }
  }

  if (data && data.length > 0) {
    const uploaderIds = [...new Set(data.map((f) => f.uploaded_by))]
    const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", uploaderIds)

    const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name]) || [])

    const filesWithProfiles = data.map((file) => ({
      ...file,
      profiles: {
        full_name: profileMap.get(file.uploaded_by) || "Unknown",
      },
    }))

    return { files: filesWithProfiles }
  }

  return { files: data || [] }
}

export async function getAssignmentLinks(assignmentId: string) {
  const { supabase, user, allowed } = await canAccessAssignment(assignmentId)
  if (!user) {
    return { error: "Not authenticated", links: [] }
  }
  if (!allowed) {
    return { error: "Not authorized", links: [] }
  }

  const { data, error } = await supabase
    .from("assignment_links")
    .select("*")
    .eq("assignment_id", assignmentId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching links:", error)
    return { links: [] }
  }

  if (data && data.length > 0) {
    const adderIds = [...new Set(data.map((l) => l.added_by))]
    const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", adderIds)

    const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name]) || [])

    const linksWithProfiles = data.map((link) => ({
      ...link,
      profiles: {
        full_name: profileMap.get(link.added_by) || "Unknown",
      },
    }))

    return { links: linksWithProfiles }
  }

  return { links: data || [] }
}

export async function addLink(
  assignmentId: string,
  title: string,
  url: string,
  description?: string,
  category?: string,
) {
  const { supabase, user, allowed } = await canAccessAssignment(assignmentId)
  if (!user) {
    return { error: "Not authenticated" }
  }
  if (!allowed) {
    return { error: "Not authorized" }
  }

  if (!title.trim()) {
    return { error: "Title is required" }
  }

  let normalizedUrl: string
  try {
    const parsed = new URL(url)
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { error: "Only HTTP and HTTPS links are allowed" }
    }
    normalizedUrl = parsed.toString()
  } catch {
    return { error: "Invalid URL" }
  }

  const { data, error } = await supabase
    .from("assignment_links")
    .insert({
      assignment_id: assignmentId,
      added_by: user.id,
      title,
      url: normalizedUrl,
      description,
      category: category || "other",
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/assignments/${assignmentId}`)
  return { success: true, link: data }
}

export async function deleteLink(linkId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase.from("assignment_links").delete().eq("id", linkId).eq("added_by", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/assignments`)
  return { success: true }
}

export async function deleteFile(fileId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data: file, error: fetchError } = await supabase
    .from("assignment_files")
    .select("id, file_url")
    .eq("id", fileId)
    .eq("uploaded_by", user.id)
    .maybeSingle()

  if (fetchError || !file) {
    return { error: "File not found" }
  }

  try {
    await del(file.file_url)
  } catch (blobError) {
    console.error("Failed to delete blob:", blobError)
    // Continue to delete metadata so we don't leave orphaned rows
  }

  const { error } = await supabase.from("assignment_files").delete().eq("id", fileId).eq("uploaded_by", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/assignments`)
  return { success: true }
}
