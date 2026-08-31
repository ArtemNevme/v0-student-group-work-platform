"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Calendar, Trash2, BookOpen } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { deleteImportedAssignment } from "@/lib/actions/google-classroom"
import { useToast } from "@/hooks/use-toast"
import { ImportToStudySyncDialog } from "./import-to-studysync-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ImportedAssignment {
  id: string
  title: string
  description: string | null
  due_date: string | null
  alternate_link: string | null
  work_type: string | null
  imported_courses: {
    name: string
    google_course_id: string
  } | null
}

interface Group {
  groups: {
    id: string
    name: string
  }
}

export function GoogleClassroomAssignments({
  assignments,
  groups,
}: {
  assignments: ImportedAssignment[]
  groups: Group[]
}) {
  const { toast } = useToast()
  const router = useRouter()
  const [selectedCourse, setSelectedCourse] = useState<string>("all")

  const courses = useMemo(() => {
    const uniqueCourses = new Map<string, string>()
    assignments.forEach((assignment) => {
      if (assignment.imported_courses) {
        uniqueCourses.set(assignment.imported_courses.google_course_id, assignment.imported_courses.name)
      }
    })
    return Array.from(uniqueCourses, ([id, name]) => ({ id, name }))
  }, [assignments])

  const filteredAssignments = useMemo(() => {
    if (selectedCourse === "all") return assignments
    return assignments.filter((a) => a.imported_courses?.google_course_id === selectedCourse)
  }, [assignments, selectedCourse])

  const groupedAssignments = useMemo(() => {
    const groups = new Map<string, ImportedAssignment[]>()
    filteredAssignments.forEach((assignment) => {
      const courseId = assignment.imported_courses?.google_course_id || "no-course"
      if (!groups.has(courseId)) {
        groups.set(courseId, [])
      }
      groups.get(courseId)!.push(assignment)
    })
    return groups
  }, [filteredAssignments])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Remove "${title}" from your imported assignments?`)) {
      return
    }

    const result = await deleteImportedAssignment(id)

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Removed",
        description: "Assignment removed from your list",
      })
      router.refresh()
    }
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-[17px] font-medium tracking-[-0.01em]">
            Imported Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={BookOpen}
            title="No assignments imported yet"
            description="Click Sync Now to import your data from Google Classroom."
            variant="card"
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="font-display text-[17px] font-medium tracking-[-0.01em]">
            Imported Assignments
          </CardTitle>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses ({assignments.length})</SelectItem>
              {courses.map((course) => {
                const count = assignments.filter((a) => a.imported_courses?.google_course_id === course.id).length
                return (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name} ({count})
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Array.from(groupedAssignments.entries()).map(([courseId, courseAssignments]) => {
            const course = courses.find((c) => c.id === courseId)
            const courseName = course?.name || "Unknown Course"

            return (
              <div key={courseId} className="space-y-3">
                {selectedCourse === "all" && (
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-secondary text-muted-foreground">
                      <BookOpen className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <h3 className="font-display text-[15px] font-medium tracking-[-0.01em] text-foreground">
                      {courseName}
                    </h3>
                    <span className="text-sm text-muted-foreground">({courseAssignments.length})</span>
                  </div>
                )}

                <div className="space-y-3">
                  {courseAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-start justify-between rounded-control border border-border bg-card p-4 transition-colors duration-150 hover:bg-secondary"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="mb-2 flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-foreground">{assignment.title}</h4>
                            {selectedCourse !== "all" && assignment.imported_courses && (
                              <p className="text-sm font-medium text-muted-foreground">
                                {assignment.imported_courses.name}
                              </p>
                            )}
                          </div>
                          <Badge variant="secondary">Google Classroom</Badge>
                        </div>

                        {assignment.description && (
                          <p className="mb-2 text-sm text-muted-foreground line-clamp-2">{assignment.description}</p>
                        )}

                        {assignment.due_date && (
                          <div className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" strokeWidth={1.75} />
                            <span>Due: {new Date(assignment.due_date).toLocaleDateString("en-US")}</span>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <ImportToStudySyncDialog
                            assignmentId={assignment.id}
                            assignmentTitle={assignment.title}
                            groups={groups}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {assignment.alternate_link && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={assignment.alternate_link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
                            </a>
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(assignment.id, assignment.title)}>
                          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
