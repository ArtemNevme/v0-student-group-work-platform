import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { getMySubjects } from "@/lib/actions/subjects"
import { getDashboardStats, getMyTasks } from "@/lib/actions/dashboard"
import { getGoogleClassroomConnection } from "@/lib/actions/google-classroom"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { PriorityTasks } from "@/components/dashboard/priority-tasks"
import { WeekOverview } from "@/components/dashboard/week-overview"
import { WelcomeHeader } from "@/components/dashboard/welcome-header"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowRight, Plus } from "lucide-react"
import { SubjectCard } from "@/components/subjects/subject-card"
import { Card, CardContent } from "@/components/ui/card"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [{ subjects }, { stats }, { tasks }, { connection }] = await Promise.all([
    getMySubjects(),
    getDashboardStats(),
    getMyTasks(),
    getGoogleClassroomConnection(),
  ])

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const urgentTasksCount =
    tasks?.filter((t) => {
      const deadline = new Date(t.tasks.assignments.deadline)
      const now = new Date()
      const hoursUntilDue = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)
      return hoursUntilDue <= 24 && hoursUntilDue > 0
    }).length || 0

  const pendingTasksCount = tasks?.length || 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DashboardHeader />

      <main className="container mx-auto px-4 sm:px-6 py-6 max-w-5xl">
        {/* Welcome Header with Level Progress */}
        <WelcomeHeader profile={profile} urgentTasksCount={urgentTasksCount} pendingTasksCount={pendingTasksCount} />

        {/* Google Classroom Connection - Compact */}
        {!connection && (
          <Link href="/dashboard/google-classroom" className="block mb-6">
            <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 p-4 flex items-center justify-between hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 dark:bg-blue-900 p-2">
                  <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-blue-900 dark:text-white text-sm">Connect Google Classroom</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">Import courses and assignments</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </Link>
        )}

        {/* Priority Tasks Section */}
        <section className="mb-6">
          <PriorityTasks tasks={tasks || []} />
        </section>

        {/* Week Overview */}
        <section className="mb-6">
          <WeekOverview tasks={tasks || []} />
        </section>

        {/* Subjects Section */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Subjects</h2>
            <Link href="/dashboard/subjects">
              <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:text-blue-700">
                View All
              </Button>
            </Link>
          </div>

          {subjects && subjects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subjects.slice(0, 6).map((subject) => (
                <SubjectCard key={subject.id} subject={subject} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No subjects yet. Connect Google Classroom to sync your courses.
                </p>
                <Link href="/dashboard/google-classroom">
                  <Button>Connect Google Classroom</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>

        <Link href="/dashboard/my-tasks">
          <Button
            size="lg"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-blue-600 hover:bg-blue-700 z-40"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </main>
    </div>
  )
}
