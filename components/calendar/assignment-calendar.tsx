"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CalendarIcon, ExternalLink } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type Assignment = {
  id: string
  title: string
  deadline: string
  status?: string
  groups?: {
    name: string
  }
  category?: string
}

type ImportedAssignment = {
  id: string
  title: string
  due_date: string
  alternate_link?: string
  imported_courses?: {
    name: string
  }
}

interface AssignmentCalendarProps {
  assignments: Assignment[]
  importedAssignments?: ImportedAssignment[]
}

const CATEGORY_COLORS: Record<string, string> = {
  project: "bg-blue-500",
  homework: "bg-green-500",
  exam: "bg-red-500",
  presentation: "bg-purple-500",
  lab: "bg-orange-500",
  other: "bg-gray-500",
}

export function AssignmentCalendar({ assignments, importedAssignments = [] }: AssignmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const { daysInMonth, startDay, today } = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const todayDate = new Date()

    return {
      daysInMonth: lastDay.getDate(),
      startDay: firstDay.getDay(),
      today:
        todayDate.getDate() === new Date().getDate() &&
        month === new Date().getMonth() &&
        year === new Date().getFullYear()
          ? todayDate.getDate()
          : null,
    }
  }, [currentDate])

  // Group assignments by day
  const assignmentsByDay = useMemo(() => {
    const map = new Map<number, (Assignment | ImportedAssignment)[]>()

    assignments.forEach((assignment) => {
      const date = new Date(assignment.deadline)
      if (date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear()) {
        const day = date.getDate()
        if (!map.has(day)) map.set(day, [])
        map.get(day)!.push(assignment)
      }
    })

    importedAssignments.forEach((assignment) => {
      if (assignment.due_date) {
        const date = new Date(assignment.due_date)
        if (date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear()) {
          const day = date.getDate()
          if (!map.has(day)) map.set(day, [])
          map.get(day)!.push(assignment)
        }
      }
    })

    return map
  }, [assignments, importedAssignments, currentDate])

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" })

  const isImportedAssignment = (item: Assignment | ImportedAssignment): item is ImportedAssignment => {
    return "due_date" in item
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Assignment Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[150px] text-center text-sm font-medium">{monthName}</span>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}

          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] border rounded-lg bg-gray-50" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dayAssignments = assignmentsByDay.get(day) || []
            const isToday = today === day

            return (
              <div
                key={day}
                className={cn(
                  "min-h-[100px] border rounded-lg p-2 bg-white hover:bg-gray-50 transition-colors",
                  isToday && "border-blue-500 border-2 bg-blue-50",
                )}
              >
                <div className={cn("text-sm font-semibold mb-1", isToday && "text-blue-600")}>{day}</div>
                <div className="space-y-1">
                  {dayAssignments.slice(0, 3).map((assignment) => {
                    if (isImportedAssignment(assignment)) {
                      return (
                        <a
                          key={assignment.id}
                          href={assignment.alternate_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <div className="text-xs bg-blue-100 text-blue-700 p-1 rounded hover:bg-blue-200 cursor-pointer truncate">
                            <div className="flex items-center gap-1">
                              <ExternalLink className="h-3 w-3 shrink-0" />
                              <span className="truncate">{assignment.title}</span>
                            </div>
                          </div>
                        </a>
                      )
                    }

                    return (
                      <Link key={assignment.id} href={`/dashboard/assignments/${assignment.id}`}>
                        <div
                          className={cn(
                            "text-xs text-white p-1 rounded hover:opacity-80 cursor-pointer truncate",
                            CATEGORY_COLORS[assignment.category || "project"],
                          )}
                        >
                          {assignment.title}
                        </div>
                      </Link>
                    )
                  })}
                  {dayAssignments.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">+{dayAssignments.length - 3} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <div className="text-sm font-medium text-gray-600">Categories:</div>
          {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
            <div key={category} className="flex items-center gap-1">
              <div className={cn("h-3 w-3 rounded", color)} />
              <span className="text-xs text-gray-600 capitalize">{category}</span>
            </div>
          ))}
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-blue-100 border border-blue-300" />
            <span className="text-xs text-gray-600">Google Classroom</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
