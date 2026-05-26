"use client"

import { Users, CheckSquare, Clock } from "lucide-react"
import { useEffect, useState } from "react"

interface StatsCardsProps {
  stats: {
    totalGroups: number
    pendingTasks: number
    upcomingDeadlines: number
    points: number
    level: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const cards = [
    {
      title: "Active Groups",
      value: stats.totalGroups,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks,
      icon: CheckSquare,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900",
      borderColor: "border-green-200 dark:border-green-800",
    },
    {
      title: "Upcoming Deadlines",
      value: stats.upcomingDeadlines,
      icon: Clock,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900",
      borderColor: "border-orange-200 dark:border-orange-800",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div
            key={card.title}
            className={`rounded-xl bg-white dark:bg-gray-900 p-5 shadow-sm border-2 ${card.borderColor} 
              transition-lift hover:shadow-xl cursor-pointer
              ${mounted ? "animate-slideUp" : "opacity-0"} stagger-${index + 1}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
              </div>
              <div className={`rounded-xl p-3 ${card.bgColor} shadow-sm`}>
                <Icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
