import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Target, Zap } from "lucide-react"

interface ProgressStatsProps {
  points: number
  level: number
  tasksCompleted: number
  groupsJoined: number
}

const POINTS_PER_LEVEL = 500

export function ProgressStats({ points, level, tasksCompleted, groupsJoined }: ProgressStatsProps) {
  const pointsInCurrentLevel = points % POINTS_PER_LEVEL
  const progressToNextLevel = (pointsInCurrentLevel / POINTS_PER_LEVEL) * 100
  const pointsToNextLevel = POINTS_PER_LEVEL - pointsInCurrentLevel

  const stats = [
    {
      label: "Level",
      value: level,
      icon: TrendingUp,
      accent: true,
      detail: `${pointsToNextLevel} pts to level ${level + 1}`,
      showProgress: true,
    },
    {
      label: "Total Points",
      value: points,
      icon: Zap,
      accent: true,
      detail: "Keep earning to level up!",
      showProgress: false,
    },
    {
      label: "Tasks Completed",
      value: tasksCompleted,
      icon: Target,
      accent: false,
      detail: "Great progress!",
      showProgress: false,
    },
    {
      label: "Groups Joined",
      value: groupsJoined,
      icon: TrendingUp,
      accent: false,
      detail: "Collaboration is key!",
      showProgress: false,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <Icon
                className={`h-4 w-4 ${stat.accent ? "text-accent-fg" : "text-muted-foreground"}`}
                strokeWidth={1.75}
              />
            </CardHeader>
            <CardContent>
              <div className="font-num text-2xl font-semibold text-foreground">{stat.value}</div>
              {stat.showProgress ? (
                <div className="mt-2">
                  <Progress value={progressToNextLevel} className="h-2" />
                  <p className="mt-1 text-xs text-muted-foreground">{stat.detail}</p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">{stat.detail}</p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
