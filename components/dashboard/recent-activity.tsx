import { formatDistanceToNow } from "date-fns"
import { MessageSquare, CheckCircle, Trophy, UserPlus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  created_at: string
  read: boolean
}

interface RecentActivityProps {
  activities: Notification[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "message":
        return MessageSquare
      case "task":
        return CheckCircle
      case "achievement":
        return Trophy
      case "invitation":
        return UserPlus
      default:
        return MessageSquare
    }
  }

  const getIconClass = (type: string) => {
    switch (type) {
      case "achievement":
        return "text-accent-fg bg-accent-soft"
      default:
        return "text-muted-foreground bg-secondary"
    }
  }

  const groupedActivities = activities.reduce(
    (acc, activity) => {
      const date = new Date(activity.created_at)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      let key = "Earlier"
      if (date.toDateString() === today.toDateString()) {
        key = "Today"
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = "Yesterday"
      } else if (date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        key = "This week"
      }

      if (!acc[key]) acc[key] = []
      acc[key].push(activity)
      return acc
    },
    {} as Record<string, typeof activities>,
  )

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 font-display text-[15px] font-medium tracking-[-0.01em]">
          <MessageSquare className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-secondary p-5 mb-3">
              <MessageSquare className="h-7 w-7 text-muted-foreground" strokeWidth={1.75} />
            </div>
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedActivities).map(([day, dayActivities]) => (
              <div key={day}>
                <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  {day}
                </h3>
                <div className="space-y-1">
                  {dayActivities.map((activity) => {
                    const Icon = getIcon(activity.type)
                    return (
                      <div
                        key={activity.id}
                        className="flex gap-3 rounded-control p-2.5 transition-colors duration-150 hover:bg-secondary"
                      >
                        <div className={`rounded-control p-2 ${getIconClass(activity.type)} flex-shrink-0 self-start`}>
                          <Icon className="h-4 w-4" strokeWidth={1.75} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{activity.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{activity.message}</p>
                          <p className="mt-1 font-num text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
