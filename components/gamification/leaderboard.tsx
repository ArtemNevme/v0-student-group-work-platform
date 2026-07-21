import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

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

function getInitials(name: string | null) {
  if (!name) return "U"
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function Leaderboard({ members, currentUserId }: LeaderboardProps) {
  // Sort by points
  const sortedMembers = [...members].sort((a, b) => b.profiles.points - a.profiles.points)
  const leaderPoints = sortedMembers[0]?.profiles.points || 1

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="font-display text-[15px] font-medium tracking-[-0.01em]">Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          {sortedMembers.map((member, index) => {
            const isCurrentUser = member.profiles.id === currentUserId
            const isLeader = index === 0
            return (
              <div key={member.id}>
                <div
                  className={`flex items-center gap-2.5 rounded-control px-2.5 py-2 transition-colors duration-150 ${
                    isCurrentUser ? "bg-accent-soft" : "hover:bg-secondary"
                  }`}
                >
                  <span
                    className={`w-7 shrink-0 font-num text-xs font-semibold ${
                      isLeader ? "text-accent-fg" : "text-muted-foreground"
                    }`}
                  >
                    #{index + 1}
                  </span>
                  <Avatar className="h-7 w-7">
                    <AvatarFallback
                      className={`text-[10.5px] font-semibold ${
                        isCurrentUser ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                      }`}
                    >
                      {getInitials(member.profiles.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <p
                    className={`flex-1 min-w-0 truncate text-[13px] ${
                      isCurrentUser ? "font-semibold text-foreground" : "font-medium text-foreground"
                    }`}
                  >
                    {member.profiles.full_name || "Unknown"}
                    {isCurrentUser && <span className="text-muted-foreground"> · you</span>}
                  </p>
                  <span
                    className={`shrink-0 font-num text-xs ${
                      isCurrentUser ? "font-semibold text-accent-fg" : "text-muted-foreground"
                    }`}
                  >
                    {member.profiles.points.toLocaleString("en-US")}
                  </span>
                </div>
                <div
                  className={`mx-2.5 mb-0.5 ml-11 h-1 overflow-hidden rounded-full ${
                    isCurrentUser ? "bg-primary/20" : "bg-secondary"
                  }`}
                >
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                    style={{ width: `${Math.round((member.profiles.points / leaderPoints) * 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
