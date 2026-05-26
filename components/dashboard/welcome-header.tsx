"use client"

import { Progress } from "@/components/ui/progress"
import { Flame, Zap, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

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
  const currentLevel = profile?.level || 1
  const currentXP = profile?.points || 0
  const streakDays = profile?.streak || 0
  const longestStreak = profile?.longest_streak || 0
  const xpForNextLevel = currentLevel * 100
  const progress = ((currentXP % 100) / xpForNextLevel) * 100

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  // Get urgency message
  const getUrgencyMessage = () => {
    if (urgentTasksCount > 0) {
      return `${urgentTasksCount} task${urgentTasksCount > 1 ? "s" : ""} due soon`
    }
    if (pendingTasksCount > 0) {
      return `${pendingTasksCount} task${pendingTasksCount > 1 ? "s" : ""} pending`
    }
    return "You're all caught up!"
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
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-violet-700 p-6 text-white shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: Greeting */}
        <div>
          <h1 className="text-2xl font-bold">
            {getGreeting()}, {firstName}!
          </h1>
          <p className={`text-sm mt-1 ${urgentTasksCount > 0 ? "text-orange-200" : "text-blue-100"}`}>
            {getUrgencyMessage()}
          </p>
        </div>

        {/* Right: Level & Streak compact */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${
              streakDays > 0 ? "bg-orange-500/20" : "bg-white/10"
            }`}
            title={
              longestStreak > 0 ? `Best streak: ${longestStreak} days` : "Complete tasks daily to build your streak!"
            }
          >
            <Flame className={`h-4 w-4 ${streakDays > 0 ? "text-orange-300" : "text-white/50"}`} />
            <span className={`text-sm font-semibold ${streakDays > 0 ? "text-orange-100" : "text-white/50"}`}>
              {streakDays}
            </span>
            {streakDays > 0 && longestStreak === streakDays && streakDays > 1 && (
              <TrendingUp className="h-3 w-3 text-green-300" title="Personal best!" />
            )}
          </div>

          {/* Level & XP */}
          <div className="flex items-center gap-3 bg-white/10 rounded-full pl-2 pr-4 py-1.5">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-sm font-bold">{currentLevel}</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-yellow-300" />
                <span className="text-xs font-medium">{displayXP} XP</span>
              </div>
              <Progress value={progress} className="h-1 w-16 bg-white/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
