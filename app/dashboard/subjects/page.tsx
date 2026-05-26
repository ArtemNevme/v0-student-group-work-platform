import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getMySubjects } from "@/lib/actions/subjects"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { SubjectCard } from "@/components/subjects/subject-card"
import { SyncSubjectsButton } from "./sync-button"
import { AutoSync } from "./auto-sync"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BookOpen, Plus, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { ReconnectGoogleClassroomButton } from "@/components/google-classroom/reconnect-button"
import { CreateGroupDialog } from "@/components/groups/create-group-dialog"

async function checkScopesNeedUpdate(supabase: any, userId: string) {
  const { data: connection } = await supabase
    .from("google_classroom_connections")
    .select("scopes")
    .eq("user_id", userId)
    .maybeSingle()

  if (!connection?.scopes) return false

  const requiredScopes = [
    "classroom.courseworkmaterials",
    "classroom.courses.readonly",
    "classroom.coursework.me.readonly",
  ]

  const scopesString =
    typeof connection.scopes === "string"
      ? connection.scopes
      : Array.isArray(connection.scopes)
        ? connection.scopes.join(" ")
        : JSON.stringify(connection.scopes || "")

  return requiredScopes.some((scope) => !scopesString.includes(scope))
}

export default async function SubjectsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { subjects } = await getMySubjects()

  const needsScopeUpdate = await checkScopesNeedUpdate(supabase, user.id)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DashboardHeader />

      <AutoSync />

      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-6xl pb-32">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Subjects</h1>
            <p className="text-muted-foreground mt-1">View and manage all your courses from Google Classroom</p>
          </div>
          {subjects && subjects.length > 0 && <SyncSubjectsButton />}
        </div>

        {needsScopeUpdate && (
          <Alert className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 dark:text-amber-200">Update Required</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              <p className="mb-3">
                To sync course materials from Google Classroom, please reconnect your account with updated permissions.
              </p>
              <ReconnectGoogleClassroomButton variant="default" size="sm" />
            </AlertDescription>
          </Alert>
        )}

        {subjects && subjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="rounded-full bg-blue-50 dark:bg-blue-950 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No subjects yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Connect your Google Classroom account to automatically sync your courses as subjects.
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/dashboard/google-classroom">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Connect Google Classroom
                  </Button>
                </Link>
                <SyncSubjectsButton />
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <div className="fixed bottom-8 right-8 z-50">
        <CreateGroupDialog subjects={subjects || []}>
          <Button
            size="lg"
            className="h-16 w-16 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all hover:scale-110 hover:shadow-xl"
            aria-label="Create Study Team"
          >
            <Plus className="h-7 w-7 text-white" />
          </Button>
        </CreateGroupDialog>
      </div>
    </div>
  )
}
