"use client"

import Link from "next/link"
import { Clock, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"

interface Task {
  id: string
  status: string
  tasks: {
    id: string
    title: string
    description: string
    estimated_hours: number
    assignments: {
      id: string
      title: string
      deadline: string
      status?: string
      groups: {
        id: string
        name: string
      }
    }
  }
}

interface PriorityTasksProps {
  tasks: Task[]
}

export function PriorityTasks({ tasks }: PriorityTasksProps) {
  const now = new Date()

  const priorityTasks = tasks
    .filter((t) => {
      // Skip completed tasks
      if (t.status === "completed") return false

      // Skip tasks from completed assignments
      if (t.tasks.assignments.status === "completed") return false

      // Skip tasks that are overdue by more than 7 days (stale tasks)
      const deadline = new Date(t.tasks.assignments.deadline)
      const daysSinceDeadline = (now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceDeadline > 7) return false

      return true
    })
    .sort((a, b) => {
      const dateA = new Date(a.tasks.assignments.deadline).getTime()
      const dateB = new Date(b.tasks.assignments.deadline).getTime()
      return dateA - dateB
    })
    .slice(0, 5)

  const getUrgencyLevel = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const hoursUntilDue = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilDue <= 0) return "overdue"
    if (hoursUntilDue <= 24) return "urgent"
    if (hoursUntilDue <= 72) return "soon"
    return "normal"
  }

  const getUrgencyStyles = (urgency: string) => {
    switch (urgency) {
      case "overdue":
        return "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30"
      case "urgent":
        return "border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30"
      case "soon":
        return "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30"
      default:
        return "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "overdue":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "urgent":
        return <Clock className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  if (priorityTasks.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <h3 className="font-semibold text-green-900 dark:text-green-100">All caught up!</h3>
        <p className="text-sm text-green-700 dark:text-green-300 mt-1">No pending tasks right now</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          Priority
        </h2>
        <Link href="/dashboard/my-tasks">
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
            View all <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        {priorityTasks.map((task) => {
          const urgency = getUrgencyLevel(task.tasks.assignments.deadline)
          return (
            <Link
              key={task.id}
              href={`/dashboard/assignments/${task.tasks.assignments.id}`}
              className={`block rounded-xl border p-4 transition-all hover:shadow-md hover:-translate-y-0.5 ${getUrgencyStyles(urgency)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">{task.tasks.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {task.tasks.assignments.groups.name}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {getUrgencyIcon(urgency)}
                  <span
                    className={`text-sm font-medium ${
                      urgency === "overdue"
                        ? "text-red-600 dark:text-red-400"
                        : urgency === "urgent"
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-gray-500"
                    }`}
                  >
                    {urgency === "overdue"
                      ? "Overdue"
                      : formatDistanceToNow(new Date(task.tasks.assignments.deadline), { addSuffix: false })}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
