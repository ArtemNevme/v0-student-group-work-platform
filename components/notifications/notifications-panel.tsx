"use client"

import { useEffect, useState } from "react"
import { Bell, Check, Mail, MessageSquare, Trophy, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { getMyNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/actions/notifications"
import { getPendingInvitations } from "@/lib/actions/notifications"
import { acceptInvitation } from "@/lib/actions/groups"
import type { RealtimePostgresChangesPayload, REALTIME_SUBSCRIBE_STATES } from "@supabase/realtime-js"
import { useRouter } from "next/navigation"
import { cleanDisplayName } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase/client"

type Notification = {
  id: string
  type: string
  title: string
  message: string
  link?: string
  read: boolean
  created_at: string
}

type Invitation = {
  id: string
  invite_code: string
  created_at: string
  expires_at: string
  groups: {
    id: string
    name: string
    description: string
    member_count: number
    max_members: number
  }
  profiles: {
    full_name: string
  }
}

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getCurrentUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      }
    }
    getCurrentUser()
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (!currentUserId) return

    async function setupRealtimeSubscription() {
      console.log("[v0] Setting up real-time subscription for notifications")

      // Get the current session and set auth token for Realtime
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.access_token) {
        console.log("[v0] Setting Realtime auth token")
        supabase.realtime.setAuth(session.access_token)
      }

      const channel = supabase
        .channel(`notifications-${currentUserId}`, {
          config: {
            broadcast: { self: false },
            presence: { key: currentUserId },
          },
        })
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${currentUserId}`,
          },
          (payload: RealtimePostgresChangesPayload<{ [key: string]: any }>) => {
            console.log("[v0] New notification received:", payload)
            const newNotification = payload.new as Notification
            setNotifications((prev) => {
              // Prevent duplicates
              if (prev.some((n) => n.id === newNotification.id)) {
                return prev
              }
              return [newNotification, ...prev]
            })
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${currentUserId}`,
          },
          (payload: RealtimePostgresChangesPayload<{ [key: string]: any }>) => {
            console.log("[v0] Notification updated:", payload)
            const updatedNotification = payload.new as Notification
            setNotifications((prev) => prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n)))
          },
        )
        .subscribe((status: REALTIME_SUBSCRIBE_STATES, err?: Error) => {
          console.log("[v0] Notifications subscription status:", status)
          if (err) {
            console.error("[v0] Notifications subscription error:", err)
          }
          if (status === "SUBSCRIBED") {
            console.log("[v0] Successfully subscribed to notifications")
          }
        })

      return () => {
        console.log("[v0] Cleaning up notifications subscription")
        supabase.removeChannel(channel)
      }
    }

    const cleanup = setupRealtimeSubscription()
    return () => {
      cleanup.then((fn) => fn?.())
    }
  }, [currentUserId, supabase])

  async function loadData() {
    setLoading(true)
    const [notifResult, inviteResult] = await Promise.all([getMyNotifications(), getPendingInvitations()])

    if (notifResult.notifications) {
      setNotifications(notifResult.notifications)
    }
    if (inviteResult.invitations) {
      setInvitations(inviteResult.invitations)
    }
    setLoading(false)
  }

  async function handleMarkAsRead(id: string) {
    await markNotificationAsRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  async function handleMarkAllAsRead() {
    await markAllNotificationsAsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  async function handleAcceptInvitation(inviteCode: string) {
    const result = await acceptInvitation(inviteCode)
    if (result.success && result.groupId) {
      router.push(`/dashboard/groups/${result.groupId}`)
    }
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case "invitation":
        return <Mail className="h-4 w-4" />
      case "message":
        return <MessageSquare className="h-4 w-4" />
      case "achievement":
        return <Trophy className="h-4 w-4" />
      case "group":
        return <Users className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-center text-sm text-muted-foreground">Loading notifications...</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-[17px] font-medium tracking-[-0.01em]">Pending Invitations</h3>
            <Badge variant="secondary">{invitations.length}</Badge>
          </div>
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="rounded-lg border bg-accent-soft p-3">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">{cleanDisplayName(invitation.groups.name)}</p>
                      <p className="text-sm text-muted-foreground">Invited by {invitation.profiles.full_name || "Someone"}</p>
                      {invitation.groups.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{invitation.groups.description}</p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {invitation.groups.member_count} / {invitation.groups.max_members} members
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleAcceptInvitation(invitation.invite_code)} className="flex-1">
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      Decline
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Expires {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}

      {/* Notifications */}
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-[17px] font-medium tracking-[-0.01em]">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && <Badge variant="secondary">{unreadCount} new</Badge>}
            {unreadCount > 0 && (
              <Button size="sm" variant="ghost" onClick={handleMarkAllAsRead}>
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="You're all caught up. New notifications will appear here."
            variant="card"
          />
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-lg border p-3 transition-colors ${notification.read ? "bg-secondary" : "bg-card"}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`rounded-full p-2 ${
                        notification.read ? "bg-secondary text-muted-foreground" : "bg-accent-soft text-accent-fg"
                      }`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">{notification.title}</p>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        {!notification.read && (
                          <Button size="sm" variant="ghost" onClick={() => handleMarkAsRead(notification.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {notification.link && (
                        <Button
                          size="sm"
                          variant="link"
                          className="mt-2 h-auto p-0"
                          onClick={() => router.push(notification.link!)}
                        >
                          View details →
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </Card>
    </div>
  )
}
