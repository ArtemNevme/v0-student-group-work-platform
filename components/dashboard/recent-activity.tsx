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

  const getIconColor = (type: string) => {
    switch (type) {
      case "message":
        return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900"
      case "task":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900"
      case "achievement":
        return "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900"
      case "invitation":
        return "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900"
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800"
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
    <Card className="shadow-md border-2 border-gray-100 dark:border-gray-800">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="rounded-xl bg-blue-100 dark:bg-blue-900 p-2">
            <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6 mb-3">
              <MessageSquare className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedActivities).map(([day, dayActivities]) => (
              <div key={day}>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  {day}
                </h3>
                <div className="space-y-3">
                  {dayActivities.map((activity) => {
                    const Icon = getIcon(activity.type)
                    return (
                      <div
                        key={activity.id}
                        className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className={`rounded-xl p-2 ${getIconColor(activity.type)} flex-shrink-0`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {activity.message}
                          </p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
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
