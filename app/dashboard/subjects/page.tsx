import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getMySubjects } from "@/lib/actions/subjects"
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
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <AutoSync />

      <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-[-0.015em] text-foreground">Your Subjects</h1>
            <p className="text-muted-foreground mt-1">View and manage all your courses from Google Classroom</p>
          </div>
          {subjects && subjects.length > 0 && <SyncSubjectsButton />}
        </div>

        {needsScopeUpdate && (
          <Alert className="mb-6 border-border bg-accent-soft">
            <AlertTriangle className="h-4 w-4 text-accent-fg" />
            <AlertTitle className="text-accent-fg">Update Required</AlertTitle>
            <AlertDescription className="text-foreground">
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
              <div className="rounded-full bg-accent-soft w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-accent-fg" strokeWidth={1.75} />
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

      <div className="fixed bottom-8 right-8 z-50">
        <CreateGroupDialog subjects={subjects || []}>
          <Button
            size="lg"
            className="h-12 w-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label="Create Study Team"
          >
            <Plus className="h-5 w-5" strokeWidth={1.75} />
          </Button>
        </CreateGroupDialog>
      </div>
    </div>
  )
}
