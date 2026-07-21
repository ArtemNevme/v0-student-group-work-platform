"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, FileUp, Link2, MessageSquare, UserPlus, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Activity {
  id: string
  type: "task_completed" | "file_uploaded" | "link_added" | "comment" | "member_joined" | "task_created"
  description: string
  timestamp: string
  user?: string
}

interface ActivityTimelineProps {
  tasks: any[]
  files: any[]
  links: any[]
}

export function ActivityTimeline({ tasks, files, links }: ActivityTimelineProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Build activity list from different sources
  const activities: Activity[] = []

  // Add completed tasks
  tasks
    .filter((t) => t.status === "completed" && t.completed_at)
    .forEach((task) => {
      activities.push({
        id: `task-${task.id}`,
        type: "task_completed",
        description: `Task "${task.title}" completed`,
        timestamp: task.completed_at,
        user: task.task_assignments?.[0]?.profiles?.full_name,
      })
    })

  // Add created tasks
  tasks.forEach((task) => {
    activities.push({
      id: `task-created-${task.id}`,
      type: "task_created",
      description: `Task "${task.title}" created`,
      timestamp: task.created_at,
    })
  })

  // Add uploaded files
  files.forEach((file) => {
    activities.push({
      id: `file-${file.id}`,
      type: "file_uploaded",
      description: `File "${file.file_name}" uploaded`,
      timestamp: file.created_at,
    })
  })

  // Add links
  links.forEach((link) => {
    activities.push({
      id: `link-${link.id}`,
      type: "link_added",
      description: `Source "${link.title || link.url}" added`,
      timestamp: link.created_at,
    })
  })

  // Sort by timestamp (newest first)
  const sortedActivities = activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8) // Show only last 8 activities

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "task_completed":
        return <CheckCircle2 className="h-4 w-4 text-success" strokeWidth={1.75} />
      case "file_uploaded":
        return <FileUp className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
      case "link_added":
        return <Link2 className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
      case "comment":
        return <MessageSquare className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
      case "member_joined":
        return <UserPlus className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
      case "task_created":
        return <Clock className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
    }
  }

  const formatTime = (timestamp: string) => {
    if (!mounted) return "recently"
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return "recently"
    }
  }

  if (sortedActivities.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" strokeWidth={1.75} />
        <p className="text-muted-foreground">No activity yet</p>
        <p className="text-xs text-muted-foreground mt-1">Activity will appear here as you work</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {sortedActivities.map((activity, index) => (
        <div key={activity.id} className="flex gap-3 py-2">
          <div className="flex flex-col items-center">
            <div className="p-1.5 rounded-full bg-secondary">{getActivityIcon(activity.type)}</div>
            {index < sortedActivities.length - 1 && <div className="w-px h-full bg-border mt-1" />}
          </div>

          <div className="flex-1 min-w-0 pb-2">
            <p className="text-sm text-foreground truncate">{activity.description}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {activity.user && <span className="text-xs text-muted-foreground">by {activity.user}</span>}
              <span className="font-num text-xs text-muted-foreground">{formatTime(activity.timestamp)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
