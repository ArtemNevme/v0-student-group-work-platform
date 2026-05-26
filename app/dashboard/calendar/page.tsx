import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getMyAssignments } from "@/lib/actions/assignments"
import { DashboardHeader } from "@/components/layout/dashboard-header"
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DashboardHeader />

      <main className="container mx-auto px-4 sm:px-6 py-6 max-w-6xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View all your assignments and deadlines in one place
          </p>
        </div>

        {/* Calendar Component */}
        <AssignmentCalendar assignments={assignments || []} importedAssignments={importedAssignments || []} />
      </main>
    </div>
  )
}
