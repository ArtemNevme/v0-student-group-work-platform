import { del } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

async function deleteFile(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { fileId } = await request.json()

    if (typeof fileId !== "string" || !fileId) {
      return NextResponse.json({ error: "File ID required" }, { status: 400 })
    }

    const { data: file, error: fileError } = await supabase
      .from("assignment_files")
      .select("id, file_url")
      .eq("id", fileId)
      .eq("uploaded_by", user.id)
      .maybeSingle()

    if (fileError || !file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    await del(file.file_url)

    // Delete from database
    const { error } = await supabase.from("assignment_files").delete().eq("id", fileId).eq("uploaded_by", user.id)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to delete file metadata" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return deleteFile(request)
}

export async function DELETE(request: NextRequest) {
  return deleteFile(request)
}
