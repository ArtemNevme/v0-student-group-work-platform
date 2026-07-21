"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Users, BookOpen, MessageSquare, Target, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfileStatsCardsProps {
  stats: {
    tasksCompleted: number
    totalTasks: number
    groupsJoined: number
    assignmentsCompleted: number
    messagesSent: number
  }
  points: number
  level: number
  streak: number
  longestStreak: number
}

export function ProfileStatsCards({ stats, points, level, streak, longestStreak }: ProfileStatsCardsProps) {
  const completionRate = stats.totalTasks > 0 ? Math.round((stats.tasksCompleted / stats.totalTasks) * 100) : 0

  const statItems = [
    {
      label: "Level",
      value: level,
      icon: Trophy,
      gamified: true,
    },
    {
      label: "Total Points",
      value: points.toLocaleString("en-US"),
      icon: Target,
      gamified: true,
    },
    {
      label: "Current Streak",
      value: `${streak} days`,
      icon: CheckCircle2,
      gamified: true,
      subtitle: `Best: ${longestStreak} days`,
    },
    {
      label: "Tasks Completed",
      value: stats.tasksCompleted,
      icon: CheckCircle2,
      gamified: false,
      subtitle: `${completionRate}% completion rate`,
    },
    {
      label: "Groups",
      value: stats.groupsJoined,
      icon: Users,
      gamified: false,
    },
    {
      label: "Assignments Done",
      value: stats.assignmentsCompleted,
      icon: BookOpen,
      gamified: false,
    },
    {
      label: "Messages Sent",
      value: stats.messagesSent,
      icon: MessageSquare,
      gamified: false,
    },
  ]

  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {statItems.map((item) => (
        <Card key={item.label} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "rounded-control p-2",
                  item.gamified ? "bg-accent-soft text-accent-fg" : "bg-secondary text-muted-foreground",
                )}
              >
                <item.icon className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">{item.label}</p>
                <p className="font-num text-[22px] leading-[1.2] font-semibold text-foreground">{item.value}</p>
                {item.subtitle && <p className="text-xs text-muted-foreground font-num">{item.subtitle}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
