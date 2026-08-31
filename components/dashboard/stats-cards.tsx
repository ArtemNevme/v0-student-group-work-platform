"use client"

import { CheckSquare, Zap, Medal, Flame } from "lucide-react"

interface StatsCardsProps {
  stats: {
    totalGroups: number
    pendingTasks: number
    upcomingDeadlines: number
    points: number
    level: number
  }
  streak: number
}

export function StatsCards({ stats, streak }: StatsCardsProps) {
  const cards = [
    {
      title: "Tasks in Progress",
      value: stats.pendingTasks,
      icon: CheckSquare,
      accent: false,
    },
    {
      title: "Experience (XP)",
      value: stats.points.toLocaleString("en-US"),
      icon: Zap,
      accent: true,
    },
    {
      title: "Level",
      value: stats.level,
      icon: Medal,
      accent: true,
    },
    {
      title: "Streak",
      value: streak,
      icon: Flame,
      accent: true,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div key={card.title} className="rounded-card border border-border bg-card p-4 sm:p-5">
            <p className="mb-2 flex items-center gap-1.5 text-[11.5px] font-medium tracking-[0.02em] text-muted-foreground">
              <Icon className={`h-3.5 w-3.5 ${card.accent ? "text-accent-fg" : ""}`} strokeWidth={1.75} />
              {card.title}
            </p>
            <p className="font-num text-2xl font-semibold leading-none text-foreground">{card.value}</p>
          </div>
        )
      })}
    </div>
  )
}
