import { del } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { fileId, fileUrl } = await request.json()

    if (!fileId || !fileUrl) {
      return NextResponse.json({ error: "File ID and URL required" }, { status: 400 })
    }

    // Delete from Vercel Blob
    await del(fileUrl)

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

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { fileId, url } = await request.json()

    if (!fileId || !url) {
      return NextResponse.json({ error: "File ID and URL required" }, { status: 400 })
    }

    // Delete from Vercel Blob
    await del(url)

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
