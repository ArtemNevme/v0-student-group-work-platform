"use client"

import { Flame, Zap, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import { format } from "date-fns"

interface WelcomeHeaderProps {
  profile: {
    full_name?: string
    level?: number
    points?: number
    streak?: number
    longest_streak?: number
  } | null
  urgentTasksCount: number
  pendingTasksCount: number
}

export function WelcomeHeader({ profile, urgentTasksCount, pendingTasksCount }: WelcomeHeaderProps) {
  const [displayXP, setDisplayXP] = useState(0)

  const firstName = profile?.full_name?.split(" ")[0] || "there"
  const currentXP = profile?.points || 0
  const streakDays = profile?.streak || 0
  const longestStreak = profile?.longest_streak || 0

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const dateLabel = format(new Date(), "EEEE, MMMM d")

  const getSubtitle = () => {
    if (urgentTasksCount > 0) {
      return `${dateLabel} · ${urgentTasksCount} task${urgentTasksCount !== 1 ? "s" : ""} due within 24 hours`
    }
    if (pendingTasksCount > 0) {
      return `${dateLabel} · ${pendingTasksCount} task${pendingTasksCount !== 1 ? "s" : ""} in progress`
    }
    return `${dateLabel} · all caught up`
  }

  useEffect(() => {
    const duration = 1000
    const steps = 40
    const increment = currentXP / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= currentXP) {
        setDisplayXP(currentXP)
        clearInterval(timer)
      } else {
        setDisplayXP(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [currentXP])

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: Greeting */}
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-[-0.015em] text-foreground">
          {getGreeting()}, {firstName}
        </h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">{getSubtitle()}</p>
      </div>

      {/* Right: Streak & XP chips */}
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-1.5 rounded-chip bg-accent-soft px-3 py-1.5"
          title={
            longestStreak > 0
              ? `Best streak: ${longestStreak} day${longestStreak !== 1 ? "s" : ""}`
              : "Complete tasks daily to build your streak"
          }
        >
          <Flame
            className={`h-4 w-4 ${streakDays > 0 ? "text-accent-fg" : "text-muted-foreground"}`}
            strokeWidth={1.75}
          />
          <span className={`font-num text-sm font-semibold ${streakDays > 0 ? "text-accent-fg" : "text-muted-foreground"}`}>
            {streakDays}
          </span>
          {streakDays > 0 && longestStreak === streakDays && streakDays > 1 && (
            <span title="Personal best!">
              <TrendingUp className="h-3 w-3 text-accent-fg" strokeWidth={1.75} />
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 rounded-chip bg-accent-soft px-3 py-1.5" title="Your XP">
          <Zap className="h-3.5 w-3.5 text-accent-fg" strokeWidth={1.75} />
          <span className="font-num text-sm font-semibold text-accent-fg">{displayXP.toLocaleString("en-US")} XP</span>
        </div>
      </div>
    </div>
  )
}
