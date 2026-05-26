import { NotificationsPanel } from "@/components/notifications/notifications-panel"

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">Stay updated with your group activities and invitations</p>
      </div>

      <NotificationsPanel />
    </div>
  )
}
