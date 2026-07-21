import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getGroupDetails, removeMember } from "@/lib/actions/groups"
import { getGroupAssignments } from "@/lib/actions/assignments"
import { getGroupMessages } from "@/lib/actions/messages"
import { getGroupLeaderboard } from "@/lib/actions/gamification"
import { InviteMemberDialog } from "@/components/groups/invite-member-dialog"
import { CreateAssignmentWizard } from "@/components/assignments/create-assignment-wizard"
import { AssignmentCard } from "@/components/assignments/assignment-card"
import { GroupChat } from "@/components/chat/group-chat"
import { Leaderboard } from "@/components/gamification/leaderboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowLeft, UserMinus } from "lucide-react"
import { LeaveGroupButton } from "@/components/groups/leave-group-button"

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const result = await getGroupDetails(id)

  if (result.error || !result.group) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <h2 className="font-display text-2xl font-semibold text-foreground">Group not found</h2>
          <p className="mt-2 text-muted-foreground">{result.error || "This group does not exist"}</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  const { group, members, currentUserRole } = result
  const isAdmin = currentUserRole === "admin"

  const { assignments } = await getGroupAssignments(id)
  const { messages } = await getGroupMessages(id)
  const { members: leaderboardMembers } = await getGroupLeaderboard(id)

  const chatMembers =
    members?.map((m) => ({
      user_id: m.user_id,
      profiles: {
        id: m.profiles.id,
        full_name: m.profiles.full_name,
        avatar_url: m.profiles.avatar_url,
      },
    })) || []

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <Link
        href="/dashboard/groups"
        className="mb-4 inline-flex items-center text-sm text-muted-foreground transition-colors duration-150 hover:text-accent-fg"
      >
        <ArrowLeft className="mr-2 h-4 w-4" strokeWidth={1.75} />
        All groups
      </Link>

      <div>
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-[-0.015em] text-foreground">{group.name}</h1>
              {group.category && <p className="mt-1 text-sm text-muted-foreground">{group.category}</p>}
              {group.description && <p className="mt-2 text-muted-foreground">{group.description}</p>}
            </div>
            <div className="flex gap-2">
              {isAdmin && <InviteMemberDialog groupId={group.id} inviteCode={group.invite_code} />}
              <LeaveGroupButton groupId={group.id} groupName={group.name} />
            </div>
          </div>
        </div>

        <Tabs defaultValue="assignments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Assignments</CardTitle>
                <CreateAssignmentWizard groupId={group.id} />
              </CardHeader>
              <CardContent>
                {assignments && assignments.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {assignments.map((assignment) => (
                      <AssignmentCard
                        key={assignment.id}
                        assignment={{ ...assignment, groups: { id: group.id, name: group.name } }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground">No assignments yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">Create an assignment to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            <GroupChat
              groupId={group.id}
              initialMessages={messages || []}
              currentUserId={user.id}
              members={chatMembers}
            />
          </TabsContent>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>
                  Members ({members?.length || 0}/{group.max_members})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members?.map((member) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{member.profiles.full_name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member.profiles.full_name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">
                            Level <span className="font-num">{member.profiles.level}</span> • <span className="font-num">{member.profiles.points}</span> pts
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.role === "admin" && (
                          <Badge variant="secondary" className="text-xs">
                            Admin
                          </Badge>
                        )}
                        {isAdmin && member.user_id !== user.id && (
                          <form
                            action={async () => {
                              "use server"
                              await removeMember(id, member.user_id)
                            }}
                          >
                            <Button type="submit" variant="ghost" size="icon" className="h-8 w-8">
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </form>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard">
            {leaderboardMembers && <Leaderboard members={leaderboardMembers} currentUserId={user.id} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
