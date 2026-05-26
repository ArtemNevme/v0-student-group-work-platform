"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Users, BookOpen, MessageSquare, Target, Trophy } from "lucide-react"

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
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      label: "Total Points",
      value: points.toLocaleString(),
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Current Streak",
      value: `${streak} days`,
      icon: CheckCircle2,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      subtitle: `Best: ${longestStreak} days`,
    },
    {
      label: "Tasks Completed",
      value: stats.tasksCompleted,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
      subtitle: `${completionRate}% completion rate`,
    },
    {
      label: "Groups",
      value: stats.groupsJoined,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Assignments Done",
      value: stats.assignmentsCompleted,
      icon: BookOpen,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      label: "Messages Sent",
      value: stats.messagesSent,
      icon: MessageSquare,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
  ]

  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {statItems.map((item) => (
        <Card key={item.label} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`rounded-lg p-2 ${item.bgColor}`}>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">{item.label}</p>
                <p className="text-lg font-bold">{item.value}</p>
                {item.subtitle && <p className="text-xs text-muted-foreground">{item.subtitle}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
