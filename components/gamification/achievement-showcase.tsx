import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"

interface Achievement {
  id: string
  earned_at: string
  achievements: {
    id: string
    name: string
    description: string
    icon: string
  }
}

interface AchievementShowcaseProps {
  achievements: Achievement[]
}

export function AchievementShowcase({ achievements }: AchievementShowcaseProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements ({achievements.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {achievements.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="rounded-lg border bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{achievement.achievements.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{achievement.achievements.name}</h4>
                    <p className="mt-1 text-xs text-gray-600">{achievement.achievements.description}</p>
                    <p className="mt-2 text-xs text-gray-500">
                      Earned {formatDistanceToNow(new Date(achievement.earned_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-gray-500">
            <p>No achievements yet</p>
            <p className="mt-1 text-xs">Complete tasks and participate to earn badges!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
