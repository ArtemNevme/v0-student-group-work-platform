"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"

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
  const [isHovered, setIsHovered] = useState(false)

  const deadline = new Date(assignment.deadline)
  const now = new Date()
  const isOverdue = deadline < now && assignment.status !== "completed"
  const timeUntilDeadline = formatDistanceToNow(deadline, { addSuffix: true })

  const statusColors = {
    not_started:
      "bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-800 dark:to-slate-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700",
    in_progress:
      "bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700",
    completed:
      "bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700",
  }

  const statusLabels = {
    not_started: "Not Started",
    in_progress: "In Progress",
    completed: "Completed",
  }

  return (
    <Link
      href={`/dashboard/assignments/${assignment.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        className="transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-2 border-gray-100 dark:border-gray-800 h-full"
        data-deadline={assignment.deadline}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <CardTitle className="text-lg text-gray-900 dark:text-white mb-2 flex items-center gap-2 group">
                {assignment.title}
                <ArrowRight
                  className={`h-4 w-4 transition-all duration-300 ${isHovered ? "translate-x-1 opacity-100" : "translate-x-0 opacity-0"}`}
                />
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {assignment.groups ? assignment.groups.name : "From Google Classroom"}
              </p>
            </div>
            <Badge className={`${statusColors[assignment.status as keyof typeof statusColors]} border-2 shadow-sm`}>
              {statusLabels[assignment.status as keyof typeof statusLabels]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {assignment.description && (
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{assignment.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${isOverdue ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
            >
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{deadline.toLocaleDateString()}</span>
            </div>
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${isOverdue ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
            >
              <Clock className="h-4 w-4" />
              <span className="font-medium">{timeUntilDeadline}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
