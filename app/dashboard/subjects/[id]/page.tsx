import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { getSubjectDetails } from "@/lib/actions/subjects"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AssignmentCard } from "@/components/assignments/assignment-card"
import { EmptyState } from "@/components/ui/empty-state"
import { BookOpen, Calendar, Users, BarChart, ArrowLeft } from "lucide-react"
import { CreateGroupDialog } from "@/components/groups/create-group-dialog"

export default async function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const result = await getSubjectDetails(id)

  if (result.error || !result.subject) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <h2 className="font-display text-2xl font-semibold text-foreground">Subject not found</h2>
          <p className="mt-2 text-muted-foreground">{result.error || "This subject does not exist"}</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  const { subject, assignments, materials, teams } = result

  const { data: allSubjects } = await supabase
    .from("subjects")
    .select("id, name, color, icon")
    .eq("user_id", user.id)
    .order("name", { ascending: true })

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <Link
        href="/dashboard/subjects"
        className="mb-4 inline-flex items-center text-sm text-muted-foreground transition-colors duration-150 hover:text-accent-fg"
      >
        <ArrowLeft className="mr-2 h-4 w-4" strokeWidth={1.75} />
        Back to Subjects
      </Link>

      {/* Subject Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-control bg-secondary text-foreground">
              <BookOpen className="h-7 w-7" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-[-0.015em] text-foreground">
                {subject.name}
              </h1>
              {subject.teacher_name && <p className="mt-1 text-sm text-muted-foreground">Teacher: {subject.teacher_name}</p>}
              {subject.description && <p className="mt-2 text-sm text-muted-foreground">{subject.description}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {subject.alternate_link && (
              <Button asChild variant="outline" size="sm">
                <a href={subject.alternate_link} target="_blank" rel="noopener noreferrer">
                  View in Google Classroom
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Assignments", value: assignments?.length || 0, icon: BookOpen },
            { label: "Materials", value: materials?.length || 0, icon: Calendar },
            { label: "Study Teams", value: teams?.length || 0, icon: Users },
            { label: "Progress", value: "75%", icon: BarChart },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <stat.icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="font-num text-2xl font-semibold text-foreground">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="assignments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="teams">Study Teams</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-[17px] font-medium tracking-[-0.01em]">Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {assignments && assignments.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {assignments.map((assignment) => (
                    <AssignmentCard key={assignment.id} assignment={assignment} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={BookOpen}
                  title="No assignments yet"
                  description="Assignments will appear here when synced from Google Classroom."
                  variant="card"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-[17px] font-medium tracking-[-0.01em]">Course Materials</CardTitle>
            </CardHeader>
            <CardContent>
              {materials && materials.length > 0 ? (
                <div className="space-y-3">
                  {materials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between rounded-control border border-border p-4 transition-colors duration-150 hover:bg-secondary"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-secondary text-muted-foreground">
                          <BookOpen className="h-5 w-5" strokeWidth={1.75} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{material.title}</p>
                          {material.description && <p className="text-sm text-muted-foreground">{material.description}</p>}
                        </div>
                      </div>
                      {material.url && (
                        <Button asChild variant="outline" size="sm">
                          <a href={material.url} target="_blank" rel="noopener noreferrer">
                            Open
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={BookOpen}
                  title="No materials yet"
                  description="Course materials will appear here when synced from Google Classroom."
                  variant="card"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display text-[17px] font-medium tracking-[-0.01em]">Study Teams</CardTitle>
              <CreateGroupDialog subjects={allSubjects || []} defaultSubjectId={id} />
            </CardHeader>
            <CardContent>
              {teams && teams.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {teams.map((team) => (
                    <Link key={team.id} href={`/dashboard/groups/${team.id}`}>
                      <Card className="transition-colors duration-150 hover:bg-secondary">
                        <CardHeader>
                          <CardTitle className="font-display text-lg font-medium tracking-[-0.01em]">{team.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">{team.member_count} members</Badge>
                            <span className="text-sm text-muted-foreground">{team.category || "Study Group"}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Users}
                  title="No study teams yet"
                  description="Create a team to collaborate with classmates on this subject."
                  variant="card"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
