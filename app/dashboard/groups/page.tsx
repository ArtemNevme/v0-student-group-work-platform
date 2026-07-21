import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { getMyGroups } from "@/lib/actions/groups"
import { getMySubjects } from "@/lib/actions/subjects"
import { CreateGroupDialog } from "@/components/groups/create-group-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, ArrowRight, Crown, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

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
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-[-0.015em] text-foreground">Groups</h1>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-num">{groups?.length || 0}</span> group{(groups?.length || 0) !== 1 ? "s" : ""}
            </p>
          </div>

          <CreateGroupDialog subjects={subjects}>
            <Button>
              <Plus className="h-4 w-4 mr-2" strokeWidth={1.75} />
              Create Group
            </Button>
          </CreateGroupDialog>
        </div>

        {/* Groups Grid */}
        {!groups || groups.length === 0 ? (
          <div className="rounded-card border border-dashed border-border p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" strokeWidth={1.75} />
            <h3 className="text-lg font-medium text-foreground mb-2">No groups yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Create your first group to start collaborating with classmates on assignments
            </p>
            <CreateGroupDialog subjects={subjects}>
              <Button>
                <Plus className="h-4 w-4 mr-2" strokeWidth={1.75} />
                Create your first group
              </Button>
            </CreateGroupDialog>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((item) => (
              <Link
                key={item.groups.id}
                href={`/dashboard/groups/${item.groups.id}`}
                className="group relative rounded-card border border-border bg-card p-5 transition-colors duration-150 hover:bg-secondary"
              >
                <div className="flex items-start gap-4">
                  {/* Group Icon */}
                  <div className="h-12 w-12 rounded-control bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                    <span className="font-display font-semibold text-base text-foreground">
                      {item.groups.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>

                  {/* Group Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">{item.groups.name}</h3>
                      {item.role === "admin" && <Crown className="h-4 w-4 text-accent-fg flex-shrink-0" />}
                    </div>

                    {item.groups.subjects && (
                      <Badge variant="secondary" className="mb-2 text-xs">
                        <span className="mr-1">{item.groups.subjects.icon}</span>
                        {item.groups.subjects.name}
                      </Badge>
                    )}

                    {item.groups.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.groups.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
                        <span className="font-num">{item.groups.member_count || 1}</span>
                        <span>members</span>
                      </div>
                      {item.groups.created_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
                          <span>{formatDistanceToNow(new Date(item.groups.created_at), { addSuffix: true })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hover Arrow */}
                <ArrowRight className="h-5 w-5 text-muted-foreground absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        )}
    </div>
  )
}
