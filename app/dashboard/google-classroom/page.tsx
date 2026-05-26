import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getGoogleClassroomConnection, getGoogleClassroomSubjects } from "@/lib/actions/google-classroom"
import { getMyGroups } from "@/lib/actions/groups"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { ConnectGoogleClassroomButton } from "@/components/google-classroom/connect-button"
import { SyncGoogleClassroomButton } from "@/components/google-classroom/sync-button"
import { GoogleClassroomSubjectsList } from "@/components/google-classroom/subjects-list"
import { DisconnectButton } from "@/components/google-classroom/disconnect-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, CheckCircle, AlertCircle } from "lucide-react"

export default async function GoogleClassroomPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const params = await searchParams
  const { connected, connection } = await getGoogleClassroomConnection()
  const { subjects } = await getGoogleClassroomSubjects()
  const { groups } = await getMyGroups()

  // Calculate total assignments across all subjects
  const totalAssignments = subjects.reduce((acc, subject) => acc + (subject.assignments?.length || 0), 0)
  const upcomingAssignments = subjects.reduce((acc, subject) => {
    const upcoming = subject.assignments?.filter((a) => a.deadline && new Date(a.deadline) > new Date()) || []
    return acc + upcoming.length
  }, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Google Classroom Integration</h1>
          <p className="mt-1 text-gray-600">Import your courses and assignments from Google Classroom</p>
        </div>

        {params.success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Successfully connected to Google Classroom! Click "Sync Now" to import your data.
            </AlertDescription>
          </Alert>
        )}

        {params.error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {params.error === "access_denied"
                ? "Access was denied. Please try again and grant the necessary permissions."
                : "An error occurred. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        {!connected ? (
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Connect Your Google Classroom
              </CardTitle>
              <CardDescription>
                Import your courses and assignments to see everything in one place alongside your StudySync projects.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">What we'll access:</h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
                  <li>Your enrolled courses</li>
                  <li>Course assignments and due dates</li>
                  <li>Assignment descriptions and details</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">We will NOT:</h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
                  <li>Create, modify, or delete anything in Google Classroom</li>
                  <li>Access your grades or submissions</li>
                  <li>Share your data with anyone</li>
                </ul>
              </div>
              <ConnectGoogleClassroomButton />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Connected to Google Classroom
                    </CardTitle>
                    <CardDescription>
                      {connection?.last_synced_at
                        ? `Last synced: ${new Date(connection.last_synced_at).toLocaleString()}`
                        : "Not yet synced"}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <SyncGoogleClassroomButton />
                    <DisconnectButton />
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{subjects.length}</div>
                  <p className="text-sm text-gray-600">Active courses</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{totalAssignments}</div>
                  <p className="text-sm text-gray-600">Total assignments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Upcoming</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{upcomingAssignments}</div>
                  <p className="text-sm text-gray-600">Due soon</p>
                </CardContent>
              </Card>
            </div>

            <GoogleClassroomSubjectsList subjects={subjects} groups={groups || []} />
          </div>
        )}
      </main>
    </div>
  )
}
