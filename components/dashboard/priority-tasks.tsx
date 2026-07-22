"use client"

import Link from "next/link"
import { Clock, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cleanDisplayName } from "@/lib/utils"
import { EmptyState } from "@/components/ui/empty-state"

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

  const getBadgeClass = (urgency: string) => {
    switch (urgency) {
      case "overdue":
        return "bg-danger/10 text-danger"
      case "urgent":
        return "bg-accent-soft text-accent-fg"
      default:
        return "bg-secondary text-muted-foreground"
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "overdue":
        return <AlertTriangle className="h-3.5 w-3.5 text-danger" strokeWidth={1.75} />
      default:
        return <Clock className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
    }
  }

  if (priorityTasks.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="All done!"
        description="No tasks in progress right now."
      />
    )
  }

  return (
    <div className="rounded-card border border-border bg-card">
      <div className="flex items-center justify-between px-4 pt-3.5 sm:px-5">
        <h2 className="font-display text-[15px] font-medium tracking-[-0.01em] text-foreground">Priority Tasks</h2>
        <Link
          href="/dashboard/my-tasks"
          className="flex items-center gap-1 text-[12.5px] text-muted-foreground transition-colors duration-150 hover:text-accent-fg"
        >
          All tasks <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </Link>
      </div>

      <div className="flex flex-col p-2">
        {priorityTasks.map((task) => {
          const urgency = getUrgencyLevel(task.tasks.assignments.deadline)
          return (
            <Link
              key={task.id}
              href={`/dashboard/assignments/${task.tasks.assignments.id}`}
              className="flex items-center justify-between gap-3 rounded-control px-2.5 py-2.5 transition-colors duration-150 hover:bg-secondary"
            >
              <div className="flex-1 min-w-0">
                <h4 className="text-[13.5px] font-medium text-foreground truncate">{task.tasks.title}</h4>
                <p className="text-[11.5px] text-muted-foreground mt-0.5">{cleanDisplayName(task.tasks.assignments.groups.name)}</p>
              </div>
              <span
                className={`flex shrink-0 items-center gap-1.5 rounded-chip px-2 py-0.5 font-num text-[11px] font-medium ${getBadgeClass(urgency)}`}
              >
                {getUrgencyIcon(urgency)}
                {urgency === "overdue"
                  ? "overdue"
                  : formatDistanceToNow(new Date(task.tasks.assignments.deadline), { addSuffix: false })}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
