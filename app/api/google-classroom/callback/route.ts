import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const OAUTH_STATE_COOKIE = "google-classroom-oauth-state"

function getAppUrl(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
  }

  return process.env.NODE_ENV === "development" ? request.nextUrl.origin : "https://studysync.click"
}

function redirectAndClearState(path: string, request: NextRequest) {
  const response = NextResponse.redirect(new URL(path, request.url))
  response.cookies.delete(OAUTH_STATE_COOKIE)
  return response
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  if (error) {
    return redirectAndClearState("/dashboard/google-classroom?error=access_denied", request)
  }

  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value
  if (!code || !state || !expectedState || state !== expectedState) {
    return redirectAndClearState("/dashboard/google-classroom?error=invalid_request", request)
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirectAndClearState("/dashboard/google-classroom?error=unauthorized", request)
  }

  try {
    const appUrl = getAppUrl(request)

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

    return redirectAndClearState("/dashboard/subjects?autosync=true", request)
  } catch (error) {
    console.error("[v0] Google Classroom OAuth error:", error)
    return redirectAndClearState("/dashboard/google-classroom?error=server_error", request)
  }
}
