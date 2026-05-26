import { put, del } from "@vercel/blob"
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

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    // Get current avatar URL to delete old one
    const { data: profile } = await supabase.from("profiles").select("avatar_url").eq("id", user.id).single()

    // Delete old avatar if exists
    if (profile?.avatar_url) {
      try {
        await del(profile.avatar_url)
      } catch (e) {
        // Ignore deletion errors
      }
    }

    // Upload new avatar with unique name
    const filename = `avatars/${user.id}-${Date.now()}.${file.name.split(".").pop()}`
    const blob = await put(filename, file, {
      access: "public",
    })

    // Update profile with new avatar URL
    await supabase.from("profiles").update({ avatar_url: blob.url }).eq("id", user.id)

    return NextResponse.json({
      url: blob.url,
    })
  } catch (error) {
    console.error("Avatar upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
