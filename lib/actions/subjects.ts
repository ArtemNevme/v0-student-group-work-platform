"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getMySubjects() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated", subjects: [] }
  }

  const { data, error } = await supabase
    .from("subjects")
    .select(`
      *,
      assignments:assignments(count),
      course_materials:course_materials(count)
    `)
    .eq("user_id", user.id)
    .order("name", { ascending: true })

  if (error) {
    return { error: error.message, subjects: [] }
  }

  return { subjects: data || [] }
}

export async function getSubjectById(subjectId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("subjects")
    .select(`
      *,
      assignments:assignments(*),
      course_materials:course_materials(*),
      groups:groups(
        *,
        group_members(count)
      )
    `)
    .eq("id", subjectId)
    .eq("user_id", user.id)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { subject: data }
}

export async function createSubject(formData: {
  name: string
  description?: string
  color?: string
  icon?: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("subjects")
    .insert({
      user_id: user.id,
      name: formData.name,
      description: formData.description || null,
      color: formData.color || "#3B82F6",
      icon: formData.icon || "BookOpen",
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { success: true, subject: data }
}

export async function updateSubject(
  subjectId: string,
  formData: {
    name?: string
    description?: string
    color?: string
    icon?: string
  },
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("subjects")
    .update(formData)
    .eq("id", subjectId)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  revalidatePath(`/dashboard/subjects/${subjectId}`)
  return { success: true, subject: data }
}

export async function deleteSubject(subjectId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase.from("subjects").delete().eq("id", subjectId).eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function getSubjectDetails(subjectId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Get subject details
  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", subjectId)
    .eq("user_id", user.id)
    .single()

  if (subjectError || !subject) {
    return { error: subjectError?.message || "Subject not found" }
  }

  // Get assignments for this subject
  const { data: assignments } = await supabase
    .from("assignments")
    .select(`
      *,
      groups:groups(id, name)
    `)
    .eq("subject_id", subjectId)
    .order("deadline", { ascending: true, nullsFirst: false })

  // Get course materials
  const { data: materials } = await supabase
    .from("course_materials")
    .select("*")
    .eq("subject_id", subjectId)
    .order("created_at", { ascending: false })

  // Get study teams (groups) for this subject
  const { data: teams } = await supabase
    .from("groups")
    .select(`
      *,
      group_members(count)
    `)
    .eq("subject_id", subjectId)
    .order("name", { ascending: true })

  return {
    subject,
    assignments: assignments || [],
    materials: materials || [],
    teams:
      teams?.map((team) => ({
        ...team,
        member_count: team.group_members?.[0]?.count || 0,
      })) || [],
  }
}
