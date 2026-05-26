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

  const getDayStatus = (date: Date) => {
    const dayTasks = getTasksForDay(date)
    if (dayTasks.length === 0) return "empty"
    if (dayTasks.length >= 3) return "busy"
    return "normal"
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">This Week</h3>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const dayTasks = getTasksForDay(day)
          const status = getDayStatus(day)
          const today = isToday(day)

          return (
            <div key={day.toISOString()} className="text-center">
              <p className={`text-xs font-medium mb-2 ${today ? "text-blue-600 dark:text-blue-400" : "text-gray-400"}`}>
                {format(day, "EEE")}
              </p>
              <div
                className={`
                  relative h-12 rounded-lg flex flex-col items-center justify-center transition-all
                  ${today ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900" : ""}
                  ${status === "empty" ? "bg-gray-100 dark:bg-gray-800" : ""}
                  ${status === "normal" ? "bg-blue-100 dark:bg-blue-900/50" : ""}
                  ${status === "busy" ? "bg-orange-100 dark:bg-orange-900/50" : ""}
                `}
              >
                <span
                  className={`text-sm font-semibold ${
                    today
                      ? "text-blue-600 dark:text-blue-400"
                      : status === "empty"
                        ? "text-gray-400"
                        : "text-gray-900 dark:text-white"
                  }`}
                >
                  {format(day, "d")}
                </span>
                {dayTasks.length > 0 && (
                  <span
                    className={`text-xs font-medium ${
                      status === "busy" ? "text-orange-600 dark:text-orange-400" : "text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {dayTasks.length}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
