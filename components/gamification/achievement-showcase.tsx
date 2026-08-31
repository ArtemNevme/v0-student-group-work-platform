import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { EmptyState } from "@/components/ui/empty-state"

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
        <CardTitle className="font-display text-[17px] font-medium tracking-[-0.01em]">
          Achievements ({achievements.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {achievements.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="rounded-card border border-border bg-card p-4 transition-colors duration-150 hover:bg-secondary"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-accent-soft text-accent-fg">
                    <Trophy className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground">{achievement.achievements.name}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">{achievement.achievements.description}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Earned {formatDistanceToNow(new Date(achievement.earned_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Trophy}
            title="No achievements yet"
            description="Complete tasks and participate to earn badges."
            variant="card"
          />
        )}
      </CardContent>
    </Card>
  )
}
