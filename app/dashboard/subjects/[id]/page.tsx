import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getSubjectDetails } from "@/lib/actions/subjects"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AssignmentCard } from "@/components/assignments/assignment-card"
import { BookOpen, Calendar, Users, BarChart, ArrowLeft } from "lucide-react"
import Link from "next/link"
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Subject not found</h2>
          <p className="mt-2 text-gray-600">{result.error || "This subject does not exist"}</p>
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
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Subject Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-lg text-2xl"
                style={{ backgroundColor: subject.color || "#3b82f6" }}
              >
                {subject.icon || "📚"}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{subject.name}</h1>
                {subject.teacher_name && <p className="mt-1 text-gray-600">Teacher: {subject.teacher_name}</p>}
                {subject.description && <p className="mt-2 text-gray-700">{subject.description}</p>}
              </div>
            </div>
            <div className="flex gap-2">
              {subject.alternate_link && (
                <Button asChild variant="outline">
                  <a href={subject.alternate_link} target="_blank" rel="noopener noreferrer">
                    View in Google Classroom
                  </a>
                </Button>
              )}
              <Button>AI Assistant</Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Assignments</p>
                  <p className="text-2xl font-bold">{assignments?.length || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Calendar className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Materials</p>
                  <p className="text-2xl font-bold">{materials?.length || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Study Teams</p>
                  <p className="text-2xl font-bold">{teams?.length || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <BarChart className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Progress</p>
                  <p className="text-2xl font-bold">75%</p>
                </div>
              </CardContent>
            </Card>
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
                <CardTitle>Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                {assignments && assignments.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {assignments.map((assignment) => (
                      <AssignmentCard key={assignment.id} assignment={assignment} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-gray-600">No assignments yet</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Assignments will appear here when synced from Google Classroom
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials">
            <Card>
              <CardHeader>
                <CardTitle>Course Materials</CardTitle>
              </CardHeader>
              <CardContent>
                {materials && materials.length > 0 ? (
                  <div className="space-y-3">
                    {materials.map((material) => (
                      <div key={material.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">📄</div>
                          <div>
                            <p className="font-medium">{material.title}</p>
                            {material.description && <p className="text-sm text-gray-600">{material.description}</p>}
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
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-gray-600">No materials yet</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Materials will appear here when synced from Google Classroom
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Study Teams</CardTitle>
                <CreateGroupDialog subjects={allSubjects || []} defaultSubjectId={id} />
              </CardHeader>
              <CardContent>
                {teams && teams.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {teams.map((team) => (
                      <Link key={team.id} href={`/dashboard/groups/${team.id}`}>
                        <Card className="cursor-pointer transition-shadow hover:shadow-md">
                          <CardHeader>
                            <CardTitle className="text-lg">{team.name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary">{team.member_count} members</Badge>
                              <span className="text-sm text-gray-600">{team.category || "Study Group"}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-gray-600">No study teams yet</p>
                    <p className="mt-1 text-sm text-gray-500">Create a team to collaborate with classmates</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
