"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// ============================================
// Connection Management
// ============================================

export async function getGoogleClassroomConnection() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated", connected: false }
  }

  const { data, error } = await supabase
    .from("google_classroom_connections")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  if (error) {
    return { error: error.message, connected: false }
  }

  return { connection: data, connected: !!data }
}

export async function disconnectGoogleClassroom() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase.from("google_classroom_connections").delete().eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/subjects")
  return { success: true }
}

// ============================================
// Token Management
// ============================================

async function refreshAccessToken(refreshToken: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  })

  if (!response.ok) {
    throw new Error("Token refresh failed")
  }

  return response.json()
}

async function getValidAccessToken(supabase: any, userId: string) {
  const { data: connection } = await supabase
    .from("google_classroom_connections")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()

  if (!connection) {
    throw new Error("Not connected to Google Classroom")
  }

  let accessToken = connection.access_token
  const tokenExpires = new Date(connection.token_expires_at)

  // Refresh if expired or expiring in next 5 minutes
  if (tokenExpires < new Date(Date.now() + 5 * 60 * 1000)) {
    const tokens = await refreshAccessToken(connection.refresh_token)
    accessToken = tokens.access_token

    await supabase
      .from("google_classroom_connections")
      .update({
        access_token: accessToken,
        token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
  }

  return accessToken
}

// ============================================
// Google Classroom API Helpers
// ============================================

async function fetchGoogleAPI(url: string, accessToken: string) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (response.status === 404) {
    return { items: [] } // No items found
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("RATE_LIMIT")
    }
    throw new Error(`API error: ${response.status}`)
  }

  const text = await response.text()
  return text ? JSON.parse(text) : {}
}

// ============================================
// Main Sync Function (Optimized)
// ============================================

export async function syncGoogleClassroom() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    const accessToken = await getValidAccessToken(supabase, user.id)

    // Step 1: Fetch all courses
    const coursesData = await fetchGoogleAPI(
      "https://classroom.googleapis.com/v1/courses?studentId=me&courseStates=ACTIVE",
      accessToken,
    )
    const courses = coursesData.courses || []

    // Step 2: Sync all subjects first (batch upsert)
    const subjectsToUpsert = courses.map((course: any) => ({
      user_id: user.id,
      google_course_id: course.id,
      name: course.name,
      description: course.descriptionHeading || null,
      teacher_name: course.ownerId || null,
      alternate_link: course.alternateLink || null,
      section: course.section || null,
      enrollment_code: course.enrollmentCode || null,
      course_state: course.courseState || null,
      color: getSubjectColor(course.name),
      icon: getSubjectIcon(course.name),
      is_synced: true,
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    // Upsert subjects
    for (const subject of subjectsToUpsert) {
      const { data: existing } = await supabase
        .from("subjects")
        .select("id")
        .eq("user_id", user.id)
        .eq("google_course_id", subject.google_course_id)
        .maybeSingle()

      if (existing) {
        await supabase.from("subjects").update(subject).eq("id", existing.id)
      } else {
        subject.created_at = new Date().toISOString()
        await supabase.from("subjects").insert(subject)
      }
    }

    // Get subject map for later use
    const { data: subjects } = await supabase
      .from("subjects")
      .select("id, google_course_id")
      .eq("user_id", user.id)
      .not("google_course_id", "is", null)

    const subjectMap = new Map(subjects?.map((s: any) => [s.google_course_id, s.id]) || [])

    // Step 3: Fetch assignments and materials in parallel (with rate limiting)
    let totalAssignments = 0
    let totalMaterials = 0
    const errors: string[] = []

    // Process courses in batches of 3 to avoid rate limiting
    const batchSize = 3
    for (let i = 0; i < courses.length; i += batchSize) {
      const batch = courses.slice(i, i + batchSize)

      await Promise.all(
        batch.map(async (course: any) => {
          const subjectId = subjectMap.get(course.id)
          if (!subjectId) return

          try {
            // Fetch assignments and materials in parallel for this course
            const [assignmentsResult, materialsResult] = await Promise.allSettled([
              fetchGoogleAPI(`https://classroom.googleapis.com/v1/courses/${course.id}/courseWork`, accessToken),
              fetchGoogleAPI(
                `https://classroom.googleapis.com/v1/courses/${course.id}/courseWorkMaterials`,
                accessToken,
              ),
            ])

            // Process assignments
            if (assignmentsResult.status === "fulfilled") {
              const assignments = assignmentsResult.value.courseWork || []
              for (const assignment of assignments) {
                await upsertAssignment(supabase, user.id, subjectId, assignment)
                totalAssignments++
              }
            }

            // Process materials
            if (materialsResult.status === "fulfilled") {
              const materials = materialsResult.value.courseWorkMaterial || []
              for (const material of materials) {
                await upsertMaterial(supabase, user.id, subjectId, material)
                totalMaterials++
              }
            }
          } catch (err: any) {
            if (err.message === "RATE_LIMIT") {
              errors.push(`Rate limited on course: ${course.name}`)
            } else {
              errors.push(`Error syncing ${course.name}: ${err.message}`)
            }
          }
        }),
      )

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < courses.length) {
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
    }

    // Update last synced time
    await supabase
      .from("google_classroom_connections")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("user_id", user.id)

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/subjects")
    revalidatePath("/dashboard/my-tasks")

    return {
      success: true,
      stats: {
        courses: courses.length,
        assignments: totalAssignments,
        materials: totalMaterials,
      },
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (error: any) {
    console.error("[v0] Sync error:", error)

    if (error.message === "Not connected to Google Classroom") {
      return { error: "not_connected", message: "Please connect to Google Classroom first" }
    }

    if (error.message.includes("Token refresh failed")) {
      return { error: "auth_expired", message: "Please reconnect to Google Classroom" }
    }

    return { error: "sync_failed", message: error.message }
  }
}

// ============================================
// Upsert Helpers
// ============================================

async function upsertAssignment(supabase: any, userId: string, subjectId: string, gcAssignment: any) {
  const dueDate = gcAssignment.dueDate
    ? new Date(
        gcAssignment.dueDate.year,
        gcAssignment.dueDate.month - 1,
        gcAssignment.dueDate.day,
        gcAssignment.dueTime?.hours || 23,
        gcAssignment.dueTime?.minutes || 59,
      )
    : null

  const { data: existing } = await supabase
    .from("assignments")
    .select("id")
    .eq("imported_from_google_id", gcAssignment.id)
    .maybeSingle()

  const assignmentData = {
    subject_id: subjectId,
    title: gcAssignment.title,
    description: gcAssignment.description || null,
    deadline: dueDate?.toISOString() || null,
    google_classroom_link: gcAssignment.alternateLink || null,
    updated_at: new Date().toISOString(),
  }

  if (existing) {
    await supabase.from("assignments").update(assignmentData).eq("id", existing.id)
  } else {
    await supabase.from("assignments").insert({
      ...assignmentData,
      imported_from_google_id: gcAssignment.id,
      created_by: userId,
      status: "not_started",
      priority: "medium",
      created_at: new Date().toISOString(),
    })
  }
}

async function upsertMaterial(supabase: any, userId: string, subjectId: string, gcMaterial: any) {
  const { data: existing } = await supabase
    .from("course_materials")
    .select("id")
    .eq("google_material_id", gcMaterial.id)
    .maybeSingle()

  // Extract material details from the first material item
  const materials = gcMaterial.materials || []
  const firstMaterial = materials[0] || {}

  let url = null
  let materialType = "other"
  let driveFileId = null
  let driveFileTitle = null
  let youtubeVideoId = null
  let formUrl = null

  if (firstMaterial.driveFile) {
    url = firstMaterial.driveFile.driveFile?.alternateLink || null
    driveFileId = firstMaterial.driveFile.driveFile?.id || null
    driveFileTitle = firstMaterial.driveFile.driveFile?.title || null
    materialType = "drive"
  } else if (firstMaterial.youtubeVideo) {
    url = `https://www.youtube.com/watch?v=${firstMaterial.youtubeVideo.id}`
    youtubeVideoId = firstMaterial.youtubeVideo.id
    materialType = "youtube"
  } else if (firstMaterial.link) {
    url = firstMaterial.link.url
    materialType = "link"
  } else if (firstMaterial.form) {
    formUrl = firstMaterial.form.formUrl
    url = formUrl
    materialType = "form"
  }

  const materialData = {
    subject_id: subjectId,
    title: gcMaterial.title || "Untitled Material",
    description: gcMaterial.description || null,
    material_type: materialType,
    url,
    drive_file_id: driveFileId,
    drive_file_title: driveFileTitle,
    youtube_video_id: youtubeVideoId,
    form_url: formUrl,
    updated_at: new Date().toISOString(),
  }

  if (existing) {
    await supabase.from("course_materials").update(materialData).eq("id", existing.id)
  } else {
    await supabase.from("course_materials").insert({
      ...materialData,
      google_material_id: gcMaterial.id,
      user_id: userId,
      created_at: new Date().toISOString(),
    })
  }
}

// ============================================
// Utility Functions
// ============================================

function getSubjectColor(name: string): string {
  const colors: Record<string, string> = {
    math: "#3B82F6",
    science: "#10B981",
    english: "#F59E0B",
    history: "#8B5CF6",
    art: "#EC4899",
    music: "#06B6D4",
    programming: "#6366F1",
    business: "#F97316",
    law: "#DC2626",
    finance: "#059669",
  }

  const lowerName = name.toLowerCase()
  for (const [key, color] of Object.entries(colors)) {
    if (lowerName.includes(key)) return color
  }

  // Random color from palette
  const palette = Object.values(colors)
  return palette[Math.floor(Math.random() * palette.length)]
}

function getSubjectIcon(name: string): string {
  const lowerName = name.toLowerCase()
  if (lowerName.includes("math")) return "📐"
  if (lowerName.includes("english") || lowerName.includes("literature")) return "📚"
  if (lowerName.includes("science") || lowerName.includes("physics") || lowerName.includes("chemistry")) return "🔬"
  if (lowerName.includes("computer") || lowerName.includes("programming") || lowerName.includes("ai")) return "💻"
  if (lowerName.includes("history")) return "📜"
  if (lowerName.includes("art")) return "🎨"
  if (lowerName.includes("music")) return "🎵"
  if (lowerName.includes("business") || lowerName.includes("management")) return "💼"
  if (lowerName.includes("law")) return "⚖️"
  if (lowerName.includes("finance") || lowerName.includes("accounting")) return "📊"
  if (lowerName.includes("speaking") || lowerName.includes("presentation")) return "🎤"
  if (lowerName.includes("trade") || lowerName.includes("international")) return "🌍"
  return "📖"
}

// ============================================
// Auto-sync Check
// ============================================

export async function shouldAutoSync() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const { data: connection } = await supabase
    .from("google_classroom_connections")
    .select("last_synced_at")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!connection) return false
  if (!connection.last_synced_at) return true

  // Auto-sync if last sync was more than 1 hour ago
  const lastSynced = new Date(connection.last_synced_at)
  return lastSynced < new Date(Date.now() - 60 * 60 * 1000)
}

// ============================================
// Legacy Compatibility Functions
// ============================================

export async function triggerAutoSync() {
  return syncGoogleClassroom()
}

export async function syncCoursesToSubjects() {
  return syncGoogleClassroom()
}

export async function getGoogleClassroomSubjects() {
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
      assignments:assignments!assignments_subject_id_fkey(id),
      materials:course_materials(id)
    `)
    .eq("user_id", user.id)
    .not("google_course_id", "is", null)
    .order("name", { ascending: true })

  if (error) {
    return { error: error.message, subjects: [] }
  }

  // Transform to include counts
  const subjects = (data || []).map((s) => ({
    ...s,
    assignments_count: s.assignments?.length || 0,
    materials_count: s.materials?.length || 0,
  }))

  return { subjects }
}

export async function getImportedCourses() {
  const result = await getGoogleClassroomSubjects()
  return {
    courses:
      result.subjects?.map((s) => ({
        id: s.id,
        name: s.name,
        google_course_id: s.google_course_id,
        teacher_name: s.teacher_name,
        alternate_link: s.alternate_link,
        created_at: s.created_at,
      })) || [],
    error: result.error,
  }
}

export async function getImportedAssignments() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated", assignments: [] }
  }

  type ImportedAssignmentRow = {
    id: string
    title: string
    description: string | null
    deadline: string | null
    status: string
    imported_from_google_id: string
    google_classroom_link: string | null
    subject_id: string
    created_at: string
    subjects: {
      id: string
      name: string
      google_course_id: string | null
    } | null
  }

  const { data, error } = await supabase
    .from("assignments")
    .select(`
      id, title, description, deadline, status,
      imported_from_google_id, google_classroom_link, subject_id,
      created_at,
      subjects:subjects!assignments_subject_id_fkey(id, name, google_course_id)
    `)
    .not("imported_from_google_id", "is", null)
    .order("deadline", { ascending: true, nullsFirst: false })

  if (error) {
    return { error: error.message, assignments: [] }
  }

  const typedData = (data as unknown) as ImportedAssignmentRow[] | null

  return {
    assignments: (typedData || []).map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      due_date: a.deadline,
      alternate_link: a.google_classroom_link,
      work_type: "ASSIGNMENT",
      google_assignment_id: a.imported_from_google_id,
      imported_course_id: a.subject_id,
      google_course_id: a.subjects?.google_course_id,
      imported_courses: a.subjects
        ? {
            id: a.subjects.id,
            name: a.subjects.name,
            google_course_id: a.subjects.google_course_id,
          }
        : null,
    })),
  }
}

export async function importToStudySyncByGoogleId(
  googleAssignmentId: string,
  groupId: string,
  title: string,
  description: string,
  deadline?: string,
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data: existing } = await supabase
    .from("assignments")
    .select("id")
    .eq("imported_from_google_id", googleAssignmentId)
    .eq("group_id", groupId)
    .maybeSingle()

  if (existing) {
    return { error: "Assignment already imported", assignmentId: existing.id }
  }

  const { data: group } = await supabase.from("groups").select("subject_id").eq("id", groupId).single()

  const { data: assignment, error } = await supabase
    .from("assignments")
    .insert({
      title,
      description,
      deadline,
      group_id: groupId,
      subject_id: group?.subject_id || null,
      status: "not_started",
      priority: "medium",
      created_by: user.id,
      imported_from_google_id: googleAssignmentId,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/my-tasks")
  return { success: true, assignmentId: assignment.id }
}

export async function importToStudySync(assignmentId: string, groupId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data: assignment } = await supabase.from("assignments").select("*").eq("id", assignmentId).single()

  if (!assignment) {
    return { error: "Assignment not found" }
  }

  return importToStudySyncByGoogleId(
    assignment.imported_from_google_id,
    groupId,
    assignment.title,
    assignment.description,
    assignment.deadline,
  )
}

export async function deleteImportedAssignment(assignmentId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase.from("assignments").delete().eq("id", assignmentId).eq("created_by", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/my-tasks")
  return { success: true }
}
