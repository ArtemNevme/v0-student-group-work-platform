import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award } from "lucide-react"

interface LeaderboardProps {
  members: Array<{
    id: string
    role: string
    profiles: {
      id: string
      full_name: string | null
      avatar_url: string | null
      points: number
      level: number
    }
  }>
  currentUserId: string
}

export function Leaderboard({ members, currentUserId }: LeaderboardProps) {
  // Sort by points
  const sortedMembers = [...members].sort((a, b) => b.profiles.points - a.profiles.points)

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedMembers.map((member, index) => {
            const isCurrentUser = member.profiles.id === currentUserId
            return (
              <div
                key={member.id}
                className={`flex items-center justify-between rounded-lg p-3 ${
                  isCurrentUser ? "bg-blue-50 ring-2 ring-blue-200" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex w-8 items-center justify-center">{getRankIcon(index)}</div>
                  <Avatar>
                    <AvatarFallback>{member.profiles.full_name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {member.profiles.full_name || "Unknown"}
                      {isCurrentUser && <span className="ml-2 text-xs text-blue-600">(You)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">Level {member.profiles.level}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="font-mono">
                  {member.profiles.points} pts
                </Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
