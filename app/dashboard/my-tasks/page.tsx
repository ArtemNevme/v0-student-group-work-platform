import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getMyAssignments } from "@/lib/actions/assignments"
import {
  getImportedAssignments,
  getGoogleClassroomConnection,
  getImportedCourses,
  shouldAutoSync,
} from "@/lib/actions/google-classroom"
import { getMyGroups } from "@/lib/actions/groups"
import { differenceInCalendarDays, startOfDay } from "date-fns"
import { MyTasksClient } from "./client"

export interface TaskItem {
  id: string
  type: "studysync" | "google"
  title: string
  description: string | null
  deadline: string | null
  status: string
  sourceId: string
  sourceName: string
  sourceType: "group" | "course"
  link: string | null
  externalLink: string | null
  assignmentId?: string
  groupId?: string
  progress?: number
  externalId?: string
  courseId?: string
  daysUntilDeadline?: number
  isCompleted?: boolean
}

function shouldHideTask(deadline: string | null, status: string): boolean {
  if (status === "completed") return false
  if (!deadline) return false

  const deadlineDate = startOfDay(new Date(deadline))
  const today = startOfDay(new Date())
  const daysUntil = differenceInCalendarDays(deadlineDate, today)

  return daysUntil < -60
}

export default async function MyTasksPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const needsSync = await shouldAutoSync()

  // Fetch all data in parallel
  const [
    { assignments },
    { assignments: importedAssignments },
    { groups: groupMemberships },
    { courses },
    { connected: isGoogleConnected },
  ] = await Promise.all([
    getMyAssignments(),
    getImportedAssignments(),
    getMyGroups(),
    getImportedCourses(),
    getGoogleClassroomConnection(),
  ])

  const groups = (groupMemberships || [])
    .map((gm: any) => gm.groups)
    .filter(
      (
        g: any,
      ): g is {
        id: string
        name: string
        description: string | null
        category: string | null
        member_count: number
        created_at: string
      } => g !== null,
    )

  // Get task counts for each assignment (for progress)
  const assignmentIds = (assignments || []).map((a) => a.id)
  const taskCounts: Record<string, { total: number; completed: number }> = {}

  if (assignmentIds.length > 0) {
    const { data: tasks } = await supabase
      .from("tasks")
      .select("assignment_id, status")
      .in("assignment_id", assignmentIds)

    if (tasks) {
      tasks.forEach((task) => {
        if (!taskCounts[task.assignment_id]) {
          taskCounts[task.assignment_id] = { total: 0, completed: 0 }
        }
        taskCounts[task.assignment_id].total++
        if (task.status === "completed") {
          taskCounts[task.assignment_id].completed++
        }
      })
    }
  }

  let hiddenStudySync = 0
  const studySyncItems: TaskItem[] = (assignments || [])
    .map((a) => {
      const hide = shouldHideTask(a.deadline, a.status)
      if (hide) {
        hiddenStudySync++
        return null
      }

      const counts = taskCounts[a.id]
      const daysUntil = a.deadline
        ? differenceInCalendarDays(startOfDay(new Date(a.deadline)), startOfDay(new Date()))
        : undefined

      return {
        id: a.id,
        type: "studysync" as const,
        title: a.title,
        description: a.description,
        deadline: a.deadline,
        status: a.status,
        sourceId: a.groups?.id || "",
        sourceName: a.groups?.name || "Unknown Group",
        sourceType: "group" as const,
        link: `/dashboard/assignments/${a.id}`,
        externalLink: null,
        assignmentId: a.id,
        groupId: a.groups?.id,
        progress: counts ? Math.round((counts.completed / counts.total) * 100) : undefined,
        daysUntilDeadline: daysUntil,
        isCompleted: a.status === "completed",
      }
    })
    .filter((item): item is TaskItem => item !== null)

  let hiddenGoogle = 0
  const googleItems: TaskItem[] = (importedAssignments || [])
    .map((a) => {
      const hide = shouldHideTask(a.due_date, "active")
      if (hide) {
        hiddenGoogle++
        return null
      }

      const daysUntil = a.due_date
        ? differenceInCalendarDays(startOfDay(new Date(a.due_date)), startOfDay(new Date()))
        : undefined

      const courseName = a.imported_courses?.name || "Google Classroom"

      return {
        id: a.id,
        type: "google" as const,
        title: a.title,
        description: a.description,
        deadline: a.due_date,
        status: "active",
        sourceId: a.imported_course_id || a.google_course_id || "",
        sourceName: courseName,
        sourceType: "course" as const,
        link: null,
        externalLink: a.alternate_link,
        externalId: a.google_assignment_id,
        courseId: a.google_course_id,
        daysUntilDeadline: daysUntil,
        isCompleted: false,
      }
    })
    .filter((item): item is TaskItem => item !== null)

  // Combine all items
  const allItems = [...studySyncItems, ...googleItems]

  const archivedCount = hiddenStudySync + hiddenGoogle

  const sources = [
    ...groups.map((g) => ({ id: g.id, name: g.name, type: "group" as const })),
    ...(courses || []).map((c) => ({ id: c.id, name: c.name, type: "course" as const })),
  ]

  const userGroupsForImport = groups.map((g) => ({ id: g.id, name: g.name }))

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <MyTasksClient
        items={allItems}
        sources={sources}
        archivedCount={archivedCount}
        isGoogleConnected={isGoogleConnected}
        userGroups={userGroupsForImport}
        needsAutoSync={needsSync}
      />
    </div>
  )
}
