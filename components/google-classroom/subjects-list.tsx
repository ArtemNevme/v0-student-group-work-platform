"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Assignment {
  id: string
  title: string
  description: string | null
  deadline: string | null
  imported_from_google_id: string | null
  google_classroom_link: string | null
  created_at: string
}

interface Subject {
  id: string
  name: string
  color: string
  icon: string
  google_course_id: string | null
  assignments: Assignment[]
}

interface Group {
  groups: {
    id: string
    name: string
  }
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : { r: 59, g: 130, b: 246 }
}

export function GoogleClassroomSubjectsList({ subjects, groups }: { subjects: Subject[]; groups: Group[] }) {
  const router = useRouter()
  const [selectedSubject, setSelectedSubject] = useState<string>("all")

  const filteredSubjects = useMemo(() => {
    if (selectedSubject === "all") return subjects
    return subjects.filter((s) => s.id === selectedSubject)
  }, [subjects, selectedSubject])

  if (subjects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Imported Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">No subjects imported yet. Click "Sync Now" to import your data.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Imported Subjects & Assignments</CardTitle>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                All Subjects ({subjects.reduce((acc, s) => acc + (s.assignments?.length || 0), 0)} assignments)
              </SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.icon} {subject.name} ({subject.assignments?.length || 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {filteredSubjects.map((subject) => {
            const rgb = hexToRgb(subject.color)
            const bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`
            const borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`
            const textColor = subject.color

            return (
              <div key={subject.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{subject.icon}</span>
                  <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                  <span className="text-sm text-gray-500">({subject.assignments?.length || 0} assignments)</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/subjects/${subject.id}`)}
                    className="ml-auto"
                  >
                    View Subject
                  </Button>
                </div>

                {subject.assignments && subject.assignments.length > 0 ? (
                  <div className="space-y-2">
                    {subject.assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-start justify-between rounded-lg border p-4"
                        style={{
                          backgroundColor: bgColor,
                          borderColor: borderColor,
                        }}
                      >
                        <div className="flex-1">
                          <div className="mb-2 flex items-start gap-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{assignment.title}</h4>
                            </div>
                            <Badge variant="secondary" className="bg-white/50">
                              Google Classroom
                            </Badge>
                          </div>

                          {assignment.description && (
                            <p className="mb-2 text-sm text-gray-600 line-clamp-2">{assignment.description}</p>
                          )}

                          {assignment.deadline && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              Due: {new Date(assignment.deadline).toLocaleDateString("en-US")}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {assignment.google_classroom_link && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={assignment.google_classroom_link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 pl-8">No assignments in this subject</p>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
