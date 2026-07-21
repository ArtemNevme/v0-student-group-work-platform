import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state") // user_id
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(new URL("/dashboard/google-classroom?error=access_denied", request.url))
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/dashboard/google-classroom?error=invalid_request", request.url))
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.id !== state) {
    return NextResponse.redirect(new URL("/dashboard/google-classroom?error=unauthorized", request.url))
  }

  try {
    const appUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${appUrl}/api/google-classroom/callback`,
        grant_type: "authorization_code",
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for tokens")
    }

    const tokens = await tokenResponse.json()

    // Store connection in database
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)

    await supabase.from("google_classroom_connections").upsert({
      user_id: user.id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: expiresAt.toISOString(),
      scopes: tokens.scope,
      connected_at: new Date().toISOString(),
    })

    return NextResponse.redirect(new URL("/dashboard/subjects?autosync=true", request.url))
  } catch (error) {
    console.error("[v0] Google Classroom OAuth error:", error)
    return NextResponse.redirect(new URL("/dashboard/google-classroom?error=server_error", request.url))
  }
}
