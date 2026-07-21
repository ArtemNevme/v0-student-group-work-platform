import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase is not configured, just pass through
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    })

    // IMPORTANT: Do not run code between createServerClient and supabase.auth.getUser()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    const isProtectedRoute =
      !request.nextUrl.pathname.startsWith("/auth") &&
      request.nextUrl.pathname !== "/" &&
      request.nextUrl.pathname !== "/privacy" &&
      request.nextUrl.pathname !== "/terms"

    if (error || !user) {
      if (error && isProtectedRoute) {
        console.error("[v0] Supabase auth error in middleware:", error.message)
      }

      // Redirect to login if trying to access protected routes
      if (isProtectedRoute) {
        const url = request.nextUrl.clone()
        url.pathname = "/auth/login"
        return NextResponse.redirect(url)
      }

      return supabaseResponse
    }

    // Redirect to dashboard if authenticated and trying to access auth pages
    if (
      user &&
      (request.nextUrl.pathname.startsWith("/auth/login") || request.nextUrl.pathname.startsWith("/auth/sign-up"))
    ) {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }

    // IMPORTANT: return supabaseResponse as-is
    return supabaseResponse
  } catch (error) {
    console.error("[v0] Middleware unexpected error:", error)

    const isProtectedRoute =
      !request.nextUrl.pathname.startsWith("/auth") &&
      request.nextUrl.pathname !== "/" &&
      request.nextUrl.pathname !== "/privacy" &&
      request.nextUrl.pathname !== "/terms"

    // Redirect to login for protected routes in case of unexpected errors
    if (isProtectedRoute) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  }
}
