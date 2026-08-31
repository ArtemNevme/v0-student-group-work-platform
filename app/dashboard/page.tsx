import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { getMySubjects } from "@/lib/actions/subjects"
import { getDashboardStats, getMyTasks, getUpcomingDeadlines } from "@/lib/actions/dashboard"
import { getMyGroups } from "@/lib/actions/groups"
import { getGroupLeaderboard } from "@/lib/actions/gamification"
import { getMyNotifications } from "@/lib/actions/notifications"
import { getGoogleClassroomConnection } from "@/lib/actions/google-classroom"
import { PriorityTasks } from "@/components/dashboard/priority-tasks"
import { WeekOverview } from "@/components/dashboard/week-overview"
import { WelcomeHeader } from "@/components/dashboard/welcome-header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { Leaderboard } from "@/components/gamification/leaderboard"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowRight, Plus, Users } from "lucide-react"
import { SubjectCard } from "@/components/subjects/subject-card"
import { EmptyState } from "@/components/ui/empty-state"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [{ subjects }, { stats }, { tasks }, { connection }, { groups }, { deadlines }, { notifications }] =
    await Promise.all([
      getMySubjects(),
      getDashboardStats(),
      getMyTasks(),
      getGoogleClassroomConnection(),
      getMyGroups(),
      getUpcomingDeadlines(),
      getMyNotifications(),
    ])

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Рейтинг первой группы пользователя (если групп нет — блок покажет empty state)
  const firstGroup = (groups || [])
    .map((item: any) => item.groups)
    .filter((group: any) => group && group.id)[0]
  let leaderboardMembers: any[] = []
  if (firstGroup) {
    const { members } = await getGroupLeaderboard(firstGroup.id)
    leaderboardMembers = members || []
  }

  const urgentTasksCount =
    tasks?.filter((t) => {
      const deadline = new Date(t.tasks.assignments.deadline)
      const now = new Date()
      const hoursUntilDue = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)
      return hoursUntilDue <= 24 && hoursUntilDue > 0
    }).length || 0

  const pendingTasksCount = tasks?.length || 0

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6">
      {/* Приветствие */}
      <WelcomeHeader profile={profile} urgentTasksCount={urgentTasksCount} pendingTasksCount={pendingTasksCount} />

      {/* Стат-карточки */}
      {stats && (
        <section className="mb-6">
          <StatsCards stats={stats} streak={profile?.streak || 0} />
        </section>
      )}

      {/* Google Classroom — компактный баннер */}
      {!connection && (
        <Link href="/dashboard/google-classroom" className="mb-6 block">
          <div className="flex items-center gap-3 rounded-card border border-border bg-card px-4 py-3 transition-colors duration-150 hover:bg-secondary">
            <BookOpen className="h-4 w-4 shrink-0 text-accent-fg" strokeWidth={1.75} />
            <p className="flex-1 text-sm text-foreground">
              Connect Google Classroom to import courses and assignments
            </p>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
          </div>
        </Link>
      )}

      {/* Основная сетка: 2fr / 1fr */}
      <div className="mb-6 grid items-start gap-3 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <PriorityTasks tasks={tasks || []} />
          <UpcomingDeadlines deadlines={deadlines || []} />
        </div>

        <div className="flex flex-col gap-3">
          <WeekOverview tasks={tasks || []} />

          {leaderboardMembers.length > 0 ? (
            <Leaderboard members={leaderboardMembers} currentUserId={user.id} />
          ) : (
            <EmptyState
              icon={Users}
              title="No leaderboard yet"
              description="Create a group or join an existing one to compete with classmates."
              action={{ label: "Create group", href: "/dashboard/groups" }}
            />
          )}

          <RecentActivity activities={notifications || []} />
        </div>
      </div>

      {/* Subjects Section */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-[17px] font-medium tracking-[-0.01em] text-foreground">Your Subjects</h2>
          <Link href="/dashboard/subjects">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-accent-fg">
              View all
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
          <EmptyState
            icon={BookOpen}
            title="No subjects yet"
            description="Connect Google Classroom to sync your courses and assignments."
            action={{ label: "Connect Google Classroom", href: "/dashboard/google-classroom" }}
          />
        )}
      </section>

      <Link href="/dashboard/my-tasks">
        <Button
          size="lg"
          className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-control bg-primary text-primary-foreground hover:bg-primary/90"
          aria-label="New task"
        >
          <Plus className="h-5 w-5" strokeWidth={1.75} />
        </Button>
      </Link>
    </div>
  )
}
