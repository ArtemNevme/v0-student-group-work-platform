import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getMyGroups } from "@/lib/actions/groups"
import { DashboardSidebar, type SidebarGroup } from "@/components/layout/dashboard-sidebar"
import { DashboardTopbar } from "@/components/layout/dashboard-topbar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [{ data: profile }, { groups }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    getMyGroups(),
  ])

  const sidebarGroups: SidebarGroup[] = (groups || [])
    .map((item: any) => item.groups)
    .filter((group: any) => group && group.id)
    .map((group: any) => ({ id: group.id as string, name: group.name as string }))

  const level = profile?.level || 1
  const points = profile?.points || 0

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardSidebar groups={sidebarGroups} level={level} points={points} />
      <div className="flex min-h-screen flex-col md:pl-60">
        <DashboardTopbar
          groups={sidebarGroups}
          level={level}
          points={points}
          fullName={profile?.full_name}
          avatarUrl={profile?.avatar_url}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
