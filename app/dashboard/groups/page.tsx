import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { getMyGroups } from "@/lib/actions/groups"
import { getMySubjects } from "@/lib/actions/subjects"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { CreateGroupDialog } from "@/components/groups/create-group-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, ArrowRight, Crown, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

// Generate consistent color based on group name
function getGroupColor(name: string): string {
  const colors = [
    "from-blue-500 to-blue-600",
    "from-violet-500 to-purple-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-amber-600",
    "from-pink-500 to-rose-600",
    "from-cyan-500 to-blue-600",
  ]
  const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[index % colors.length]
}

export default async function GroupsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [groupsResult, subjectsResult] = await Promise.all([getMyGroups(), getMySubjects()])

  const { groups, error } = groupsResult
  const { subjects } = subjectsResult

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DashboardHeader />

      <main className="container mx-auto px-4 sm:px-6 py-6 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Study Teams</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {groups?.length || 0} team{groups?.length !== 1 ? "s" : ""}
            </p>
          </div>

          <CreateGroupDialog subjects={subjects}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </CreateGroupDialog>
        </div>

        {/* Groups Grid */}
        {!groups || groups.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
            <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No study teams yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Create your first study team to start collaborating with classmates on assignments
            </p>
            <CreateGroupDialog subjects={subjects}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Team
              </Button>
            </CreateGroupDialog>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((item) => (
              <Link
                key={item.groups.id}
                href={`/dashboard/groups/${item.groups.id}`}
                className="group relative rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
              >
                {/* Gradient accent bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${getGroupColor(item.groups.name)}`}
                />

                <div className="flex items-start gap-4">
                  {/* Group Icon */}
                  <div
                    className={`h-12 w-12 rounded-xl bg-gradient-to-br ${getGroupColor(item.groups.name)} flex items-center justify-center flex-shrink-0 shadow-md`}
                  >
                    <span className="text-white font-bold text-base">
                      {item.groups.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>

                  {/* Group Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.groups.name}</h3>
                      {item.role === "admin" && <Crown className="h-4 w-4 text-amber-500 flex-shrink-0" />}
                    </div>

                    {item.groups.subjects && (
                      <Badge variant="secondary" className="mb-2 text-xs">
                        <span className="mr-1">{item.groups.subjects.icon}</span>
                        {item.groups.subjects.name}
                      </Badge>
                    )}

                    {item.groups.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                        {item.groups.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        <span>
                          {item.groups.member_count || 1} member{(item.groups.member_count || 1) !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {item.groups.created_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDistanceToNow(new Date(item.groups.created_at), { addSuffix: true })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hover Arrow */}
                <ArrowRight className="h-5 w-5 text-gray-300 dark:text-gray-600 absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
