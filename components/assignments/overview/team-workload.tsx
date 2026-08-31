"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

interface TeamMember {
  id: string
  full_name: string
  avatar_url?: string
}

interface Task {
  id: string
  title: string
  status: string
  estimated_hours?: number
  task_assignments?: {
    profiles: TeamMember
  }[]
}

interface TeamWorkloadProps {
  tasks: Task[]
  members: TeamMember[]
}

export function TeamWorkload({ tasks, members }: TeamWorkloadProps) {
  // Calculate workload for each member
  const memberWorkload = members.map((member) => {
    const assignedTasks = tasks.filter((task) => task.task_assignments?.some((ta) => ta.profiles?.id === member.id))
    const completedTasks = assignedTasks.filter((t) => t.status === "completed")
    const totalHours = assignedTasks.reduce((sum, t) => sum + (t.estimated_hours || 1), 0)

    return {
      member,
      totalTasks: assignedTasks.length,
      completedTasks: completedTasks.length,
      totalHours,
      progress: assignedTasks.length > 0 ? (completedTasks.length / assignedTasks.length) * 100 : 0,
    }
  })

  // Get unassigned tasks
  const unassignedTasks = tasks.filter((task) => !task.task_assignments || task.task_assignments.length === 0)

  // Sort by number of tasks (most first)
  const sortedWorkload = memberWorkload.sort((a, b) => b.totalTasks - a.totalTasks)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Color based on progress
  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-success"
    return "bg-primary"
  }

  if (members.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No team members yet"
        description="Invite classmates to the group to see their workload."
      />
    )
  }

  return (
    <div className="space-y-4">
      {sortedWorkload.map(({ member, totalTasks, completedTasks, totalHours, progress }) => (
        <div key={member.id} className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={member.avatar_url || undefined} />
            <AvatarFallback className="text-xs bg-secondary text-muted-foreground">
              {getInitials(member.full_name || "?")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-foreground truncate">{member.full_name}</span>
              <span className="font-num text-xs text-muted-foreground ml-2">
                {completedTasks}/{totalTasks} tasks
              </span>
            </div>

            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressColor(progress)} rounded-full transition-all duration-300`}
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">~<span className="font-num">{totalHours}h</span> estimated</span>
              <span className="font-num text-xs text-muted-foreground">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      ))}

      {unassignedTasks.length > 0 && (
        <div className="pt-2 mt-2 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-accent-fg">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span>
              <span className="font-num">{unassignedTasks.length}</span> unassigned task{unassignedTasks.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
