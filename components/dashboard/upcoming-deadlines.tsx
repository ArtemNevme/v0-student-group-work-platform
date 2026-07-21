"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Calendar, AlertCircle, ExternalLink, Clock, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Assignment {
  id: string
  title: string
  deadline: string
  status: string
  groups: {
    id: string
    name: string
  }
  source: "studysync" | "google_classroom"
  alternate_link: string | null
}

interface UpcomingDeadlinesProps {
  deadlines: Assignment[]
}

export function UpcomingDeadlines({ deadlines }: UpcomingDeadlinesProps) {
  const getDaysUntil = (deadline: string) =>
    Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  const getDeadlineBadgeClass = (deadline: string) => {
    const daysUntil = getDaysUntil(deadline)
    if (daysUntil < 0) return "bg-danger/10 text-danger"
    if (daysUntil <= 1) return "bg-accent-soft text-accent-fg"
    return "bg-secondary text-muted-foreground"
  }

  const getUrgencyIcon = (deadline: string) => {
    const daysUntil = getDaysUntil(deadline)
    if (daysUntil <= 1) return <AlertCircle className="h-4 w-4 text-danger" strokeWidth={1.75} />
    return <Clock className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 font-display text-[15px] font-medium tracking-[-0.01em]">
          <Calendar className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        {deadlines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="h-10 w-10 text-success mb-3" strokeWidth={1.75} />
            <p className="text-sm font-medium text-foreground mb-1">All done!</p>
            <p className="text-xs text-muted-foreground">No deadlines in the next 7 days</p>
          </div>
        ) : (
          <div className="space-y-2">
            {deadlines.slice(0, 5).map((assignment) => (
              <div
                key={`${assignment.source}-${assignment.id}`}
                className="rounded-control border border-border p-3.5 transition-colors duration-150 hover:bg-secondary"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      {getUrgencyIcon(assignment.deadline)}
                      <h4 className="font-medium text-foreground text-sm truncate">{assignment.title}</h4>
                      {assignment.source === "google_classroom" && (
                        <Badge variant="secondary" className="text-xs">
                          Google
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{assignment.groups.name}</p>
                    <span
                      className={`inline-flex rounded-chip px-2 py-0.5 font-num text-[11px] font-medium ${getDeadlineBadgeClass(assignment.deadline)}`}
                    >
                      {formatDistanceToNow(new Date(assignment.deadline), { addSuffix: true })}
                    </span>
                  </div>
                  {assignment.source === "google_classroom" && assignment.alternate_link ? (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={assignment.alternate_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
                      </a>
                    </Button>
                  ) : (
                    <Link href={`/dashboard/assignments/${assignment.id}`}>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-accent-fg">
                        View
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
