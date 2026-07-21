"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getAssignmentFiles(assignmentId: string) {
  const supabase = await createClient()

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
  const supabase = await createClient()

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
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("assignment_links")
    .insert({
      assignment_id: assignmentId,
      added_by: user.id,
      title,
      url,
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

  const { error } = await supabase.from("assignment_files").delete().eq("id", fileId).eq("uploaded_by", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/assignments`)
  return { success: true }
}
