"use client"

import { useMemo } from "react"
import { addDays, startOfWeek, format, isSameDay, isToday } from "date-fns"

interface Task {
  id: string
  status: string
  tasks: {
    id: string
    title: string
    assignments: {
      id: string
      deadline: string
    }
  }
}

interface WeekOverviewProps {
  tasks: Task[]
}

export function WeekOverview({ tasks }: WeekOverviewProps) {
  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 }) // Monday
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [])

  const getTasksForDay = (date: Date) => {
    return tasks.filter((task) => {
      const deadline = new Date(task.tasks.assignments.deadline)
      return isSameDay(deadline, date) && task.status !== "completed"
    })
  }

  return (
    <div className="rounded-card border border-border bg-card p-4">
      <h3 className="mb-4 text-[11.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">This Week</h3>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const dayTasks = getTasksForDay(day)
          const today = isToday(day)

          return (
            <div key={day.toISOString()} className="text-center">
              <p
                className={`mb-2 text-xs font-medium capitalize ${today ? "text-accent-fg" : "text-muted-foreground"}`}
              >
                {format(day, "EEE")}
              </p>
              <div
                className={`
                  relative flex h-12 flex-col items-center justify-center rounded-control transition-colors duration-150
                  ${today ? "ring-2 ring-ring" : ""}
                  ${dayTasks.length > 0 ? "bg-accent-soft" : "bg-secondary"}
                `}
              >
                <span
                  className={`font-num text-sm font-semibold ${
                    today
                      ? "text-accent-fg"
                      : dayTasks.length > 0
                        ? "text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {format(day, "d")}
                </span>
                {dayTasks.length > 0 && (
                  <span className="font-num text-xs font-medium text-accent-fg">{dayTasks.length}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
