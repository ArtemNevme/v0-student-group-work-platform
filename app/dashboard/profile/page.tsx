import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserAchievements } from "@/lib/actions/gamification"
import { getProfileStats } from "@/lib/actions/profile"
import { AchievementShowcase } from "@/components/gamification/achievement-showcase"
import { Card, CardContent } from "@/components/ui/card"
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog"
import { AvatarUpload } from "@/components/profile/avatar-upload"
import { ActivityHeatmap } from "@/components/profile/activity-heatmap"
import { ProfileStatsCards } from "@/components/profile/profile-stats-cards"
import { Flame, Calendar, Mail, GraduationCap, BookOpen } from "lucide-react"
import { format } from "date-fns"

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { achievements } = await getUserAchievements(user.id)
  const stats = await getProfileStats(user.id)

  const memberSince = profile?.created_at ? format(new Date(profile.created_at), "MMMM yyyy") : "Unknown"

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      {/* Profile Header Card */}
      <Card className="mb-6 overflow-hidden">
        {/* Cover gradient */}
        <div className="h-32 bg-secondary" />

          <CardContent className="relative px-6 pb-6">
            {/* Avatar positioned over cover */}
            <div className="absolute -top-14 left-6">
              <AvatarUpload avatarUrl={profile?.avatar_url} fullName={profile?.full_name} />
            </div>

            {/* Edit button */}
            <div className="flex justify-end pt-2">
              <EditProfileDialog
                profile={{
                  full_name: profile?.full_name,
                  bio: profile?.bio,
                  major: profile?.major,
                  year: profile?.year,
                }}
              />
            </div>

            {/* Profile info */}
            <div className="mt-4">
              <h1 className="font-display text-2xl font-semibold tracking-[-0.015em] text-foreground">
                {profile?.full_name || "User"}
              </h1>

              {profile?.bio && <p className="mt-2 text-muted-foreground max-w-2xl">{profile.bio}</p>}

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile?.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    <span>{profile.email}</span>
                  </div>
                )}
                {profile?.major && (
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    <span>{profile.major}</span>
                  </div>
                )}
                {profile?.year && (
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4" />
                    <span>{profile.year}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {memberSince}</span>
                </div>
                {(profile?.streak || 0) > 0 && (
                  <div className="flex items-center gap-1.5 text-accent-fg">
                    <Flame className="h-4 w-4" strokeWidth={1.75} />
                    <span>
                      <span className="font-num">{profile.streak}</span> day streak
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="mb-6">
          <h2 className="font-display text-[17px] font-medium tracking-[-0.01em] text-foreground mb-3">Statistics</h2>
          <ProfileStatsCards
            stats={stats}
            points={profile?.points || 0}
            level={profile?.level || 1}
            streak={profile?.streak || 0}
            longestStreak={profile?.longest_streak || 0}
          />
        </div>

        {/* Activity Heatmap */}
        <div className="mb-6">
          <ActivityHeatmap activityMap={stats.activityMap} />
        </div>

        {/* Achievements */}
        <AchievementShowcase achievements={achievements || []} />
    </div>
  )
}
