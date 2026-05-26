import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getAssignmentDetails, deleteAssignmentAndRedirect } from "@/lib/actions/assignments"
import { getAssignmentFiles, getAssignmentLinks } from "@/lib/actions/files"
import { EditAssignmentDialog } from "@/components/assignments/edit-assignment-dialog"
import { WorkLinkField } from "@/components/assignments/work-link-field"
import { CompleteAssignmentButton } from "@/components/assignments/complete-assignment-button"
import { AssignmentTabs } from "@/components/assignments/assignment-tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { ArrowLeft, Calendar, Trash2, Clock, Users, CheckCircle2, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { AddToTeamDialog } from "@/components/assignments/add-to-team-dialog"

export default async function AssignmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  console.log("[v0] Assignment page loading, awaiting params...")
  const { id } = await params
  console.log("[v0] Assignment ID:", id)

  console.log("[v0] Creating Supabase client...")
  const supabase = await createClient()

  console.log("[v0] Getting user...")
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log("[v0] No user found, redirecting to login")
    redirect("/auth/login")
  }

  console.log("[v0] User found:", user.id)
  console.log("[v0] Fetching assignment details...")

  const result = await getAssignmentDetails(id)

  console.log("[v0] Assignment details result:", result.error ? `ERROR: ${result.error}` : "SUCCESS")

  if (result.error || !result.assignment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Assignment not found</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{result.error || "This assignment does not exist"}</p>
            <Button asChild className="mt-6">
              <Link href="/dashboard/my-tasks">Back to My Tasks</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { assignment, tasks } = result

  if (!assignment.group_id || !assignment.groups) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{assignment.title}</h2>
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                From Google Classroom
              </Badge>
            </div>

            {assignment.description && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">{assignment.description}</p>
              </div>
            )}

            {assignment.deadline && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <Calendar className="h-4 w-4" />
                Due: {format(new Date(assignment.deadline), "MMM d, yyyy 'at' h:mm a")}
              </div>
            )}

            <div className="border-t dark:border-gray-800 pt-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Add to Study Team</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                This assignment is from Google Classroom and needs to be added to a Study Team to collaborate with
                classmates.
              </p>
              <AddToTeamDialog assignment={assignment} />
            </div>

            <div className="mt-6 pt-6 border-t dark:border-gray-800">
              <Button asChild variant="ghost" className="w-full">
                <Link href="/dashboard/subjects">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Subjects
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!assignment.profiles) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Invalid assignment data</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">This assignment has missing or corrupted data</p>
            <Button asChild className="mt-6">
              <Link href="/dashboard/my-tasks">Back to My Tasks</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const deadline = new Date(assignment.deadline)

  const statusConfig = {
    not_started: {
      color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      label: "Not Started",
      icon: Clock,
    },
    in_progress: {
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      label: "In Progress",
      icon: Clock,
    },
    completed: {
      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      label: "Completed",
      icon: CheckCircle2,
    },
  }

  const currentStatus = statusConfig[assignment.status as keyof typeof statusConfig] || statusConfig.not_started
  const StatusIcon = currentStatus.icon

  const isCreator = assignment.created_by === user.id
  const hasTasks = tasks && tasks.length > 0
  const completedTasks = tasks?.filter((t) => t.status === "completed").length || 0
  const totalTasks = tasks?.length || 0
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const { data: members } = await supabase
    .from("group_members")
    .select("user_id, profiles(id, full_name, email)")
    .eq("group_id", assignment.groups.id)

  const formattedMembers =
    members?.map((m) => ({
      user_id: m.user_id,
      profiles: {
        id: (m.profiles as any)?.id || "",
        full_name: (m.profiles as any)?.full_name || "",
      },
    })) || []

  const filesResult = await getAssignmentFiles(id)
  const files = filesResult.files || []

  const linksResult = await getAssignmentLinks(id)
  const links = linksResult.links || []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur-sm dark:bg-gray-900/95">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Link
              href={`/dashboard/groups/${assignment.groups.id}`}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {assignment.groups.name}
            </Link>
            <div className="flex items-center gap-2">
              {assignment.status !== "completed" && (
                <CompleteAssignmentButton assignmentId={assignment.id} status={assignment.status} />
              )}
              <EditAssignmentDialog assignment={assignment} />
              {isCreator && (
                <form action={deleteAssignmentAndRedirect.bind(null, id)}>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6">
        <Card className="mb-6 overflow-hidden">
          <div className={`h-2 ${assignment.status === "completed" ? "bg-green-500" : "bg-blue-500"}`} />
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 mb-3">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">{assignment.title}</h1>
                  <Badge className={`${currentStatus.color} shrink-0`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {currentStatus.label}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {assignment.groups.name}
                  </span>
                  <span className="flex items-center gap-1">Created by {assignment.profiles.full_name}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(deadline, "MMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>
              </div>

              {hasTasks && (
                <div className="lg:w-48 shrink-0">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {completedTasks} of {totalTasks} tasks completed
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t dark:border-gray-800">
              <WorkLinkField assignmentId={assignment.id} initialWorkLink={assignment.work_link} />
            </div>
          </CardContent>
        </Card>

        <AssignmentTabs
          assignment={assignment}
          tasks={tasks || []}
          files={files || []}
          links={links || []}
          members={formattedMembers}
          currentUserId={user.id}
        />
      </main>
    </div>
  )
}
