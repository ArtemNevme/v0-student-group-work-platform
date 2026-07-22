"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Calendar, BookOpen } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
          <CardTitle className="font-display text-[17px] font-medium tracking-[-0.01em]">Imported Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={BookOpen}
            title="No subjects imported yet"
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
            Imported Subjects & Assignments
          </CardTitle>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                All Subjects ({subjects.reduce((acc, s) => acc + (s.assignments?.length || 0), 0)} assignments)
              </SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name} ({subject.assignments?.length || 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {filteredSubjects.map((subject) => (
            <div key={subject.id} className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-secondary text-foreground">
                  <BookOpen className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-[15px] font-medium tracking-[-0.01em] text-foreground">
                  {subject.name}
                </h3>
                <span className="text-sm text-muted-foreground">
                  ({subject.assignments?.length || 0} assignments)
                </span>
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
                      className="flex items-start justify-between rounded-control border border-border bg-card p-4 transition-colors duration-150 hover:bg-secondary"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="mb-2 flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-foreground">{assignment.title}</h4>
                          </div>
                          <Badge variant="secondary">Google Classroom</Badge>
                        </div>

                        {assignment.description && (
                          <p className="mb-2 text-sm text-muted-foreground line-clamp-2">{assignment.description}</p>
                        )}

                        {assignment.deadline && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" strokeWidth={1.75} />
                            <span>Due: {new Date(assignment.deadline).toLocaleDateString("en-US")}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {assignment.google_classroom_link && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={assignment.google_classroom_link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="pl-8 text-sm text-muted-foreground">No assignments in this subject</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
