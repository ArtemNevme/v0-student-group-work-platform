"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Calendar, AlertCircle, ExternalLink, Clock, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getUrgencyColor = (deadline: string) => {
    const daysUntil = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntil <= 1)
      return "bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-950 dark:to-pink-950 text-red-800 dark:text-red-200 border-red-300 dark:border-red-800"
    if (daysUntil <= 3)
      return "bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-950 dark:to-amber-950 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-800"
    return "bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-950 dark:to-cyan-950 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-800"
  }

  const getUrgencyIcon = (deadline: string) => {
    const daysUntil = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntil <= 1) return <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
    return <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
  }

  return (
    <Card className="shadow-lg border-2 border-gray-100 dark:border-gray-800">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 p-2 shadow-md">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          Next Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        {deadlines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-fadeIn">
            <div className="rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950 dark:to-emerald-950 p-4 mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">All caught up!</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">No deadlines in the next 7 days</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deadlines.slice(0, 5).map((assignment, index) => (
              <div
                key={`${assignment.source}-${assignment.id}`}
                className={`rounded-xl border-2 ${getUrgencyColor(assignment.deadline)} p-4 
                  transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer
                  ${mounted ? "animate-slideUp" : "opacity-0"} stagger-${index + 1}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="mb-1.5 flex items-center gap-2">
                      {getUrgencyIcon(assignment.deadline)}
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{assignment.title}</h4>
                      {assignment.source === "google_classroom" && (
                        <Badge
                          variant="secondary"
                          className="bg-white/50 dark:bg-gray-900/50 text-blue-700 dark:text-blue-300 text-xs border border-blue-300 dark:border-blue-700"
                        >
                          Google
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium mb-2">
                      {assignment.groups.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge className="text-xs font-semibold bg-white/70 dark:bg-gray-900/70 text-gray-900 dark:text-white border-0 shadow-sm">
                        {formatDistanceToNow(new Date(assignment.deadline), { addSuffix: true })}
                      </Badge>
                    </div>
                  </div>
                  {assignment.source === "google_classroom" && assignment.alternate_link ? (
                    <Button variant="ghost" size="sm" asChild className="hover:bg-white/50 dark:hover:bg-gray-900/50">
                      <a href={assignment.alternate_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  ) : (
                    <Link href={`/dashboard/assignments/${assignment.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-white/50 dark:hover:bg-gray-900/50 font-medium"
                      >
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
