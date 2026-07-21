import { NotificationsPanel } from "@/components/notifications/notifications-panel"

export default function NotificationsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-[-0.015em] text-foreground">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">Stay updated with your group activities and invitations</p>
      </div>

      <NotificationsPanel />
    </div>
  )
}
