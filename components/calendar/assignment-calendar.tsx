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

// Статусные стили чипов дедлайнов по DESIGN.md §5: всегда текст + цвет
function getAssignmentChipClass(assignment: Assignment): string {
  if (assignment.status === "completed") return "bg-secondary text-success"
  const deadline = new Date(assignment.deadline)
  const now = new Date()
  const isToday = deadline.toDateString() === now.toDateString()
  if (isToday) return "bg-accent-soft text-accent-fg"
  if (deadline.getTime() < now.getTime()) return "bg-danger/10 text-danger"
  return "bg-secondary text-foreground"
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

  const monthName = currentDate.toLocaleString("en-US", { month: "long", year: "numeric" })

  const isImportedAssignment = (item: Assignment | ImportedAssignment): item is ImportedAssignment => {
    return "due_date" in item
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-display text-[17px] font-medium tracking-[-0.01em] text-foreground">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
            Assignment Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[150px] text-center font-num text-sm font-medium text-foreground">{monthName}</span>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] rounded-card border border-border/60 bg-secondary/40" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dayAssignments = assignmentsByDay.get(day) || []
            const isToday = today === day

            return (
              <div
                key={day}
                className={cn(
                  "min-h-[100px] rounded-card border border-border p-2 bg-card transition-colors duration-150 hover:bg-secondary",
                  isToday && "border-primary bg-accent-soft hover:bg-accent-soft",
                )}
              >
                <div className={cn("font-num text-sm font-medium mb-1 text-foreground", isToday && "text-accent-fg")}>{day}</div>
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
                          <div className="text-xs bg-secondary text-foreground p-1 rounded-chip hover:bg-secondary/70 transition-colors duration-150 cursor-pointer truncate">
                            <div className="flex items-center gap-1">
                              <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" strokeWidth={1.75} />
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
                            "text-xs p-1 rounded-chip hover:opacity-80 transition-opacity duration-150 cursor-pointer truncate",
                            getAssignmentChipClass(assignment),
                          )}
                        >
                          {assignment.title}
                        </div>
                      </Link>
                    )
                  })}
                  {dayAssignments.length > 3 && (
                    <div className="font-num text-xs text-muted-foreground text-center">+{dayAssignments.length - 3} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="text-xs font-medium text-muted-foreground">Legend:</div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-chip bg-secondary border border-border" />
            <span className="text-xs text-muted-foreground">Upcoming</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-chip bg-accent-soft border border-accent-fg/30" />
            <span className="text-xs text-muted-foreground">Due today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-chip bg-danger/10 border border-danger/30" />
            <span className="text-xs text-muted-foreground">Overdue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ExternalLink className="h-3 w-3 text-muted-foreground" strokeWidth={1.75} />
            <span className="text-xs text-muted-foreground">Google Classroom</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
