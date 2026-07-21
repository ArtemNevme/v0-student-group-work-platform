import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getMyAssignments } from "@/lib/actions/assignments"
import { AssignmentCalendar } from "@/components/calendar/assignment-calendar"

export default async function CalendarPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get StudySync assignments
  const { assignments } = await getMyAssignments()

  // Get imported Google Classroom assignments
  const { data: importedAssignments } = await supabase
    .from("imported_assignments")
    .select(`
      *,
      imported_courses (
        name
      )
    `)
    .eq("user_id", user.id)
    .order("due_date", { ascending: true })

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-[-0.015em] text-foreground">Calendar</h1>
        <p className="text-sm text-muted-foreground mt-1">View all your assignments and deadlines in one place</p>
      </div>

      {/* Calendar Component */}
      <AssignmentCalendar assignments={assignments || []} importedAssignments={importedAssignments || []} />
    </div>
  )
}
