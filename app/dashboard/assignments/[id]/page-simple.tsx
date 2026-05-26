import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function SimpleAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  console.log("[v0] Starting SimpleAssignmentPage render")

  try {
    // Step 1: Await params
    console.log("[v0] Step 1: Awaiting params")
    const { id } = await params
    console.log("[v0] Assignment ID:", id)

    // Step 2: Create Supabase client
    console.log("[v0] Step 2: Creating Supabase client")
    const supabase = await createClient()

    // Step 3: Get user
    console.log("[v0] Step 3: Getting user")
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log("[v0] No user, redirecting to login")
      redirect("/auth/sign-in")
    }

    console.log("[v0] User ID:", user.id)

    // Step 4: Get assignment
    console.log("[v0] Step 4: Fetching assignment")
    const { data: assignment, error: assignmentError } = await supabase
      .from("assignments")
      .select("*")
      .eq("id", id)
      .single()

    if (assignmentError) {
      console.error("[v0] Assignment error:", assignmentError)
      throw assignmentError
    }

    if (!assignment) {
      console.log("[v0] Assignment not found")
      return (
        <div className="container mx-auto p-6">
          <h1>Assignment not found</h1>
        </div>
      )
    }

    console.log("[v0] Assignment loaded:", assignment.title)

    // Step 5: Render simple page
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{assignment.title}</h1>
        <p className="text-muted-foreground mb-4">{assignment.description}</p>
        <div className="space-y-2">
          <p>
            <strong>Status:</strong> {assignment.status}
          </p>
          <p>
            <strong>Due Date:</strong>{" "}
            {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : "No due date"}
          </p>
          <p>
            <strong>Course:</strong> {assignment.course_id}
          </p>
        </div>
      </div>
    )
  } catch (error) {
    console.error("[v0] Error in SimpleAssignmentPage:", error)
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <pre className="bg-gray-100 p-4 rounded">{error instanceof Error ? error.message : "Unknown error"}</pre>
      </div>
    )
  }
}
