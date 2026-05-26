"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Flame, Award, Sparkles } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"

interface LevelWidgetProps {
  profile: {
    level: number
    points: number
    streak_days?: number
  }
}

export function LevelWidget({ profile }: LevelWidgetProps) {
  const [displayXP, setDisplayXP] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  const currentLevel = profile.level || 1
  const currentXP = profile.points || 0
  const xpForNextLevel = currentLevel * 100
  const progress = ((currentXP % 100) / xpForNextLevel) * 100
  const xpNeeded = xpForNextLevel - (currentXP % 100)
  const streakDays = profile.streak_days || 0

  useEffect(() => {
    const duration = 1500
    const steps = 60
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
    <Card className="shadow-lg border-2 border-blue-100 dark:border-blue-900 bg-gradient-to-br from-white via-blue-50/50 to-violet-50/50 dark:from-gray-900 dark:via-blue-950/30 dark:to-violet-950/30 overflow-hidden relative">
      <div className="absolute top-4 right-4 animate-pulse-slow">
        <Sparkles className="h-5 w-5 text-yellow-500" />
      </div>

      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
          Level & Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Level Circle with enhanced animation */}
        <div className="flex items-center gap-6">
          <div className="relative animate-scaleIn">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-xl">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{currentLevel}</div>
                <div className="text-xs text-blue-100 font-medium">Level</div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-900 animate-pulse">
              <Award className="h-5 w-5 text-white" />
            </div>
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{displayXP} XP</p>
            <Progress value={progress} className="h-3 mb-2 shadow-inner" />
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-blue-600 dark:text-blue-400">+{xpNeeded} XP</span> to reach Level{" "}
              {currentLevel + 1}
            </p>
          </div>
        </div>

        {/* Enhanced Streak Tracker */}
        <div className="rounded-xl bg-gradient-to-r from-orange-100 via-red-100 to-pink-100 dark:from-orange-950 dark:via-red-950 dark:to-pink-950 p-5 border-2 border-orange-300 dark:border-orange-800 shadow-md relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-red-400/10 animate-pulse-slow" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gradient-to-br from-orange-500 to-red-500 p-2.5 shadow-md">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">🔥 Streak</p>
                <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">Keep it up!</p>
              </div>
            </div>
            <div className="text-4xl font-bold bg-gradient-to-br from-orange-600 to-red-600 bg-clip-text text-transparent">
              {streakDays}
            </div>
          </div>
        </div>

        {/* Quick Stats with improved layout */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-4 border-2 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Total XP</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{displayXP}</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-950 dark:to-violet-950 p-4 border-2 border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Rank</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              #{Math.max(1, 100 - currentLevel)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
