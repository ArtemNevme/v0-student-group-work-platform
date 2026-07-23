import { del, put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "image/jpeg",
  "image/png",
])

function getSafeFilename(name: string) {
  const extension = name.includes(".") ? `.${name.split(".").pop()}` : ""
  const baseName = name.slice(0, name.length - extension.length).replace(/[^a-zA-Z0-9_-]/g, "-") || "file"
  return `${baseName.slice(0, 80)}${extension.toLowerCase()}`
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file")
    const assignmentId = formData.get("assignmentId")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (typeof assignmentId !== "string" || !assignmentId) {
      return NextResponse.json({ error: "No assignment ID provided" }, { status: 400 })
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size must be between 1 byte and 10MB" }, { status: 400 })
    }

    if (!ALLOWED_FILE_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
    }

    const { data: assignment } = await supabase
      .from("assignments")
      .select("group_id, created_by")
      .eq("id", assignmentId)
      .single()
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    const isPersonalAssignment = assignment.group_id === null
    const hasAccess = isPersonalAssignment
      ? assignment.created_by === user.id
      : (
          await supabase
            .from("group_members")
            .select("id")
            .eq("group_id", assignment.group_id)
            .eq("user_id", user.id)
            .maybeSingle()
        ).data !== null

    if (!hasAccess) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Upload to Vercel Blob
    const blob = await put(`assignments/${assignmentId}/${user.id}/${crypto.randomUUID()}-${getSafeFilename(file.name)}`, file, {
      access: "public",
    })

    // Save file metadata to database
    const { data, error } = await supabase
      .from("assignment_files")
      .insert({
        assignment_id: assignmentId,
        uploaded_by: user.id,
        file_name: file.name,
        file_url: blob.url,
        file_size: file.size,
        file_type: file.type,
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      await del(blob.url).catch(() => undefined)
      return NextResponse.json({ error: "Failed to save file metadata" }, { status: 500 })
    }

    return NextResponse.json({
      id: data.id,
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
