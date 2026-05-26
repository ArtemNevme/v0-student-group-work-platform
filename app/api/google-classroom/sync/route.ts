import { NextResponse } from "next/server"
import { syncGoogleClassroom } from "@/lib/actions/google-classroom"

export async function POST() {
  const result = await syncGoogleClassroom()

  if (result.error) {
    const status = result.error === "auth_expired" ? 401 : result.error === "not_connected" ? 400 : 500
    return NextResponse.json(result, { status })
  }

  return NextResponse.json(result)
}
