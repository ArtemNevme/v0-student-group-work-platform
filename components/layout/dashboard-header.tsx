import { createClient } from "@/lib/supabase/server"
import { getMyNotifications } from "@/lib/actions/notifications"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { GlobalSearch } from "@/components/search/global-search"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

export async function DashboardHeader() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { notifications } = await getMyNotifications()

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm supports-[backdrop-filter]:bg-white/80 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/80 shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="transition-opacity hover:opacity-80">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              StudySinc
            </h1>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/my-tasks"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Tasks
            </Link>
            <Link
              href="/dashboard/subjects"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Subjects
            </Link>
            <Link
              href="/dashboard/calendar"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Calendar
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <GlobalSearch />
          <ThemeToggle />
          <NotificationCenter initialNotifications={notifications || []} />
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <Avatar className="h-9 w-9 ring-2 ring-blue-500/20">
              {profile?.avatar_url && (
                <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.full_name || "User"} />
              )}
              <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 to-violet-500 text-white font-semibold">
                {profile?.full_name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{profile?.full_name || "User"}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Level {profile?.level || 1} • {profile?.points || 0} XP
              </p>
            </div>
          </Link>
          <form action="/auth/signout" method="post">
            <Button variant="ghost" size="sm" type="submit">
              Sign Out
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
