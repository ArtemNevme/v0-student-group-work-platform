"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cleanDisplayName } from "@/lib/utils"

interface AssignmentCardProps {
  assignment: {
    id: string
    title: string
    description: string | null
    deadline: string
    status: string
    category?: string
    groups: {
      id: string
      name: string
    } | null // groups can be null for Google Classroom assignments
  }
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const deadline = new Date(assignment.deadline)
  const now = new Date()
  const isOverdue = deadline < now && assignment.status !== "completed"
  const isToday = deadline.toDateString() === now.toDateString()
  const timeUntilDeadline = formatDistanceToNow(deadline, { addSuffix: true })

  const statusColors = {
    not_started: "bg-secondary text-muted-foreground border-border",
    in_progress: "bg-accent-soft text-accent-fg border-transparent",
    completed: "bg-success/10 text-success border-transparent",
  }

  const statusLabels = {
    not_started: "Not Started",
    in_progress: "In Progress",
    completed: "Completed",
  }

  const deadlineChipClass = isOverdue
    ? "bg-danger/10 text-danger"
    : isToday
      ? "bg-accent-soft text-accent-fg"
      : "bg-secondary text-muted-foreground"

  return (
    <Link href={`/dashboard/assignments/${assignment.id}`} className="group block h-full">
      <Card
        className="h-full transition-colors duration-150 hover:border-muted-foreground/40"
        data-deadline={assignment.deadline}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <CardTitle className="font-display text-base font-medium tracking-[-0.01em] text-foreground mb-2 flex items-center gap-2 transition-colors duration-150 group-hover:text-accent-fg">
                {assignment.title}
                <ArrowRight
                  className="h-4 w-4 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                  strokeWidth={1.75}
                />
              </CardTitle>
              <p className="text-sm text-muted-foreground font-medium">
                {assignment.groups ? cleanDisplayName(assignment.groups.name) : "From Google Classroom"}
              </p>
            </div>
            <Badge className={`${statusColors[assignment.status as keyof typeof statusColors]} border`}>
              {statusLabels[assignment.status as keyof typeof statusLabels]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {assignment.description && (
            <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{assignment.description}</p>
          )}
          <div className="flex items-center gap-2 text-sm">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-chip ${deadlineChipClass}`}>
              <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span className="font-num text-xs font-medium">{deadline.toLocaleDateString("en-US")}</span>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-chip ${deadlineChipClass}`}>
              <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span className="text-xs font-medium">{timeUntilDeadline}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
