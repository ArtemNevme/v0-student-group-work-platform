"use server"

import { createClient } from "@/lib/supabase/server"
import { createNotification } from "./notifications"

const POINTS_PER_LEVEL = 500

export async function updateStreak(userId: string) {
  const supabase = await createClient()

  // Get current user profile with streak data
  const { data: profile } = await supabase
    .from("profiles")
    .select("streak, last_activity_date, longest_streak")
    .eq("id", userId)
    .single()

  if (!profile) {
    return { error: "User not found" }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split("T")[0]

  const lastActivity = profile.last_activity_date ? new Date(profile.last_activity_date) : null

  if (lastActivity) {
    lastActivity.setHours(0, 0, 0, 0)
  }

  const lastActivityStr = lastActivity?.toISOString().split("T")[0]

  // If already recorded activity today, no change
  if (lastActivityStr === todayStr) {
    return {
      success: true,
      streak: profile.streak,
      message: "Activity already recorded today",
    }
  }

  let newStreak = profile.streak || 0
  let streakBroken = false

  if (lastActivity) {
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split("T")[0]

    if (lastActivityStr === yesterdayStr) {
      // Consecutive day - increment streak
      newStreak += 1
    } else {
      // Streak broken - reset to 1
      newStreak = 1
      streakBroken = profile.streak > 0
    }
  } else {
    // First activity ever
    newStreak = 1
  }

  // Update longest streak if current is higher
  const longestStreak = Math.max(profile.longest_streak || 0, newStreak)

  // Update profile
  const { error } = await supabase
    .from("profiles")
    .update({
      streak: newStreak,
      last_activity_date: todayStr,
      longest_streak: longestStreak,
    })
    .eq("id", userId)

  if (error) {
    return { error: error.message }
  }

  // Send notifications for streak milestones
  if (newStreak === 7) {
    await createNotification(
      userId,
      "achievement",
      "7 Day Streak!",
      "You've been active for 7 days in a row! Keep it up!",
      "/dashboard",
    )
  } else if (newStreak === 30) {
    await createNotification(
      userId,
      "achievement",
      "30 Day Streak!",
      "Incredible! You've maintained a 30-day streak!",
      "/dashboard",
    )
  } else if (newStreak > 0 && newStreak % 10 === 0) {
    await createNotification(
      userId,
      "achievement",
      `${newStreak} Day Streak!`,
      `Amazing! You've been active for ${newStreak} days in a row!`,
      "/dashboard",
    )
  }

  return {
    success: true,
    streak: newStreak,
    longestStreak,
    streakBroken,
    isNewRecord: newStreak === longestStreak && newStreak > 1,
  }
}

export async function getStreakInfo(userId: string) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("streak, last_activity_date, longest_streak")
    .eq("id", userId)
    .single()

  if (!profile) {
    return { streak: 0, longestStreak: 0, isActive: false }
  }

  // Check if streak is still valid (last activity was today or yesterday)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const lastActivity = profile.last_activity_date ? new Date(profile.last_activity_date) : null

  let isActive = false
  let currentStreak = profile.streak || 0

  if (lastActivity) {
    lastActivity.setHours(0, 0, 0, 0)
    const diffDays = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

    // Streak is active if last activity was today or yesterday
    isActive = diffDays <= 1

    // If more than 1 day passed, streak is effectively 0
    if (diffDays > 1) {
      currentStreak = 0
    }
  }

  return {
    streak: currentStreak,
    longestStreak: profile.longest_streak || 0,
    isActive,
    lastActivityDate: profile.last_activity_date,
  }
}

export async function awardPoints(userId: string, points: number, reason: string) {
  const supabase = await createClient()

  // Get current user stats
  const { data: profile } = await supabase.from("profiles").select("points, level").eq("id", userId).single()

  if (!profile) {
    return { error: "User not found" }
  }

  const newPoints = profile.points + points
  const newLevel = Math.floor(newPoints / POINTS_PER_LEVEL) + 1

  // Update points and level
  const { error } = await supabase
    .from("profiles")
    .update({
      points: newPoints,
      level: newLevel,
    })
    .eq("id", userId)

  if (error) {
    return { error: error.message }
  }

  await updateStreak(userId)

  // Check if user leveled up
  if (newLevel > profile.level) {
    await createNotification(
      userId,
      "achievement",
      "Level Up!",
      `Congratulations! You've reached level ${newLevel}`,
      "/dashboard",
    )
  }

  // Check for achievements
  await checkAndAwardAchievements(userId)

  return { success: true, newPoints, newLevel }
}

export async function checkAndAwardAchievements(userId: string) {
  const supabase = await createClient()

  // Get user stats
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (!profile) return

  // Get user's current achievements
  const { data: userAchievements } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId)

  const earnedAchievementIds = new Set(userAchievements?.map((ua) => ua.achievement_id) || [])

  // Get all achievements
  const { data: achievements } = await supabase.from("achievements").select("*")

  if (!achievements) return

  // Check each achievement
  for (const achievement of achievements) {
    if (earnedAchievementIds.has(achievement.id)) continue

    let shouldAward = false

    switch (achievement.name) {
      case "Early Bird": {
        // Check if user has submitted 5 tasks early
        const { data: earlyTasks } = await supabase
          .from("task_assignments")
          .select("*, tasks(*)")
          .eq("user_id", userId)
          .eq("status", "completed")
          .not("completed_at", "is", null)

        const earlyCount =
          earlyTasks?.filter((ta) => {
            if (!ta.completed_at || !ta.tasks) return false
            // Consider early if completed before the assignment deadline
            return true // Simplified for now
          }).length || 0

        shouldAward = earlyCount >= 5
        break
      }

      case "Deadline Crusher": {
        // Check if user has completed 10 tasks on time
        const { count } = await supabase
          .from("task_assignments")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("status", "completed")

        shouldAward = (count || 0) >= 10
        break
      }

      case "Rising Star": {
        shouldAward = profile.level >= 5
        break
      }

      case "Group Leader": {
        // Check if user has created 3 groups
        const { count } = await supabase
          .from("groups")
          .select("*", { count: "exact", head: true })
          .eq("created_by", userId)

        shouldAward = (count || 0) >= 3
        break
      }

      case "Collaborator": {
        // Check if user has sent 100 messages
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)

        shouldAward = (count || 0) >= 100
        break
      }

      case "Overachiever": {
        shouldAward = profile.points >= 1000
        break
      }

      case "Week Warrior": {
        shouldAward = (profile.streak || 0) >= 7
        break
      }

      case "Month Master": {
        shouldAward = (profile.streak || 0) >= 30
        break
      }

      case "Streak Legend": {
        shouldAward = (profile.longest_streak || 0) >= 100
        break
      }
    }

    if (shouldAward) {
      // Award achievement
      await supabase.from("user_achievements").insert({
        user_id: userId,
        achievement_id: achievement.id,
      })

      // Notify user
      await createNotification(
        userId,
        "achievement",
        "Achievement Unlocked!",
        `You've earned the "${achievement.name}" badge: ${achievement.description}`,
        "/dashboard",
      )
    }
  }
}

export async function getGroupLeaderboard(groupId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Verify user is member of the group
  const { data: membership } = await supabase
    .from("group_members")
    .select("*")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    return { error: "Not authorized" }
  }

  // Get all members with their stats
  const { data: members, error } = await supabase
    .from("group_members")
    .select(
      `
      *,
      profiles (
        id,
        full_name,
        avatar_url,
        points,
        level,
        streak
      )
    `,
    )
    .eq("group_id", groupId)
    .order("profiles(points)", { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { members }
}

export async function getUserAchievements(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("user_achievements")
    .select(
      `
      *,
      achievements (
        id,
        name,
        description,
        icon
      )
    `,
    )
    .eq("user_id", userId)
    .order("earned_at", { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { achievements: data }
}
