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

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Level</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{level}</div>
          <div className="mt-2">
            <Progress value={progressToNextLevel} className="h-2" />
            <p className="mt-1 text-xs text-muted-foreground">
              {pointsToNextLevel} pts to level {level + 1}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Points</CardTitle>
          <Zap className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{points}</div>
          <p className="text-xs text-muted-foreground">Keep earning to level up!</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
          <Target className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{tasksCompleted}</div>
          <p className="text-xs text-muted-foreground">Great progress!</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Groups Joined</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{groupsJoined}</div>
          <p className="text-xs text-muted-foreground">Collaboration is key!</p>
        </CardContent>
      </Card>
    </div>
  )
}
