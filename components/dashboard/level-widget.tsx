"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Flame } from "lucide-react"
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

  const currentLevel = profile.level || 1
  const currentXP = profile.points || 0
  const xpForNextLevel = currentLevel * 100
  const xpInLevel = currentXP % 100
  const progress = xpForNextLevel > 0 ? Math.min(xpInLevel / xpForNextLevel, 1) : 0
  const streakDays = profile.streak_days || 0

  const radius = 34
  const circumference = 2 * Math.PI * radius

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
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 font-display text-[15px] font-medium tracking-[-0.01em]">
          <Trophy className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          Level & Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Level ring */}
        <div className="flex items-center gap-5">
          <div className="relative h-20 w-20 shrink-0">
            <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
              <circle cx="40" cy="40" r={radius} fill="none" strokeWidth="4" className="stroke-secondary" />
              <circle
                cx="40"
                cy="40"
                r={radius}
                fill="none"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                className="stroke-primary transition-[stroke-dashoffset] duration-500 ease-out"
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <span className="font-num text-xl font-semibold text-accent-fg">{currentLevel}</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-num text-sm font-semibold text-foreground mb-1">
              {displayXP.toLocaleString("en-US")} XP
            </p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              <span className="font-num">
                {xpInLevel} / {xpForNextLevel}
              </span>{" "}
              XP to Level <span className="font-num">{currentLevel + 1}</span>
            </p>
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center justify-between rounded-control border border-border bg-accent-soft px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Flame className="h-5 w-5 text-accent-fg" strokeWidth={1.75} />
            <p className="text-sm font-medium text-foreground">Streak</p>
          </div>
          <p className="font-num text-xl font-semibold text-accent-fg">
            {streakDays} <span className="text-xs font-medium">days</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
