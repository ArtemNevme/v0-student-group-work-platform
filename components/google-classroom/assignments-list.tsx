"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Calendar, Trash2, BookOpen } from "lucide-react"
import { deleteImportedAssignment } from "@/lib/actions/google-classroom"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { ImportToStudySyncDialog } from "./import-to-studysync-dialog"
import { useState, useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

const getCourseColor = (courseName: string) => {
  const colors = [
    { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
    { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
    { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
    { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
    { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-200" },
    { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200" },
  ]

  const hash = courseName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
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
          <CardTitle>Imported Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">
            No assignments imported yet. Click "Sync Now" to import your data.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Imported Assignments</CardTitle>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-[200px]">
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
            const colors = getCourseColor(courseName)

            return (
              <div key={courseId} className="space-y-3">
                {selectedCourse === "all" && (
                  <div className="flex items-center gap-2">
                    <BookOpen className={`h-4 w-4 ${colors.text}`} />
                    <h3 className="font-semibold text-gray-900">{courseName}</h3>
                    <span className="text-sm text-gray-500">({courseAssignments.length})</span>
                  </div>
                )}

                <div className="space-y-3">
                  {courseAssignments.map((assignment) => {
                    const courseColors = assignment.imported_courses
                      ? getCourseColor(assignment.imported_courses.name)
                      : { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" }

                    return (
                      <div
                        key={assignment.id}
                        className={`flex items-start justify-between rounded-lg border ${courseColors.border} ${courseColors.bg} p-4`}
                      >
                        <div className="flex-1">
                          <div className="mb-2 flex items-start gap-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{assignment.title}</h4>
                              {selectedCourse !== "all" && assignment.imported_courses && (
                                <p className={`text-sm ${courseColors.text} font-medium`}>
                                  {assignment.imported_courses.name}
                                </p>
                              )}
                            </div>
                            <Badge variant="secondary" className="bg-white/50">
                              Google Classroom
                            </Badge>
                          </div>

                          {assignment.description && (
                            <p className="mb-2 text-sm text-gray-600 line-clamp-2">{assignment.description}</p>
                          )}

                          {assignment.due_date && (
                            <div className="mb-3 flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              Due: {new Date(assignment.due_date).toLocaleDateString("en-US")}
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
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(assignment.id, assignment.title)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
