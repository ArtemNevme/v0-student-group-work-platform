"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EmptyState } from "@/components/ui/empty-state"
import { Bell, MessageSquare, CheckCircle2, Clock, Mail, Trophy } from "lucide-react"
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/actions/notifications"
import type { RealtimePostgresChangesPayload } from "@supabase/realtime-js"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  read: boolean
  created_at: string
}

interface NotificationCenterProps {
  initialNotifications: Notification[]
}

export function NotificationCenter({ initialNotifications }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const unreadCount = notifications.filter((n) => !n.read).length

  // Subscribe to new notifications
  useEffect(() => {
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload: RealtimePostgresChangesPayload<{ [key: string]: any }>) => {
          setNotifications((prev) => [payload.new as Notification, ...prev])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id)
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))
    }
    if (notification.link) {
      router.push(notification.link)
    }
    setOpen(false)
  }

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4" strokeWidth={1.75} />
      case "task":
        return <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
      case "deadline":
        return <Clock className="h-4 w-4" strokeWidth={1.75} />
      case "invitation":
        return <Mail className="h-4 w-4" strokeWidth={1.75} />
      case "achievement":
        return <Trophy className="h-4 w-4" strokeWidth={1.75} />
      default:
        return <Bell className="h-4 w-4" strokeWidth={1.75} />
    }
  }

  const getNotificationIconClass = (type: string) => {
    switch (type) {
      case "achievement":
        return "text-accent-fg bg-accent-soft"
      default:
        return "text-muted-foreground bg-secondary"
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" strokeWidth={1.75} />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-xs text-on-accent">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="h-auto p-0 text-xs">
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`cursor-pointer p-3 ${!notification.read ? "bg-accent-soft" : ""}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-control ${getNotificationIconClass(
                      notification.type,
                    )}`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.read && <div className="h-2 w-2 rounded-full bg-accent-fg" />}
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <EmptyState
              icon={Bell}
              title="No notifications yet"
              description="You're all caught up."
              className="border-none bg-transparent p-4"
            />
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
