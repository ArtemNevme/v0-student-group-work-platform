"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ListChecks, Calendar, Users, BookOpen, Bell, User } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SidebarGroup {
  id: string
  name: string
}

export interface DashboardSidebarProps {
  groups: SidebarGroup[]
  level: number
  points: number
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/my-tasks", label: "Tasks", icon: ListChecks },
  { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
  { href: "/dashboard/groups", label: "Groups", icon: Users },
  { href: "/dashboard/subjects", label: "Subjects", icon: BookOpen },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/profile", label: "Profile", icon: User },
]

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard"
  return pathname.startsWith(href)
}

function navItemClass(active: boolean) {
  return cn(
    "flex h-8 items-center gap-2.5 rounded-md px-2 text-[13.5px] font-medium transition-colors duration-150",
    active ? "bg-secondary text-accent-fg" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
  )
}

/** Содержимое сайдбара — используется и в десктопной колонке, и в мобильном Sheet */
export function SidebarContent({ groups, level, points }: DashboardSidebarProps) {
  const pathname = usePathname()

  const xpForNextLevel = level * 100
  const xpInLevel = points % 100
  const progress = xpForNextLevel > 0 ? Math.min(xpInLevel / xpForNextLevel, 1) : 0
  const radius = 19
  const circumference = 2 * Math.PI * radius

  return (
    <div className="flex h-full flex-col px-3 py-4">
      <Link href="/dashboard" className="flex items-center gap-2.5 px-2 pb-4">
        <span className="grid h-[26px] w-[26px] place-items-center rounded-md bg-primary font-display text-sm font-semibold text-primary-foreground">
          S
        </span>
        <span className="font-display text-[15px] font-semibold tracking-[-0.01em]">StudySinc</span>
      </Link>

      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className={navItemClass(isActive(pathname, item.href))}>
            <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </nav>

      {groups.length > 0 && (
        <>
          <p className="mx-2 mb-1.5 mt-4 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Groups
          </p>
          <nav className="flex flex-col gap-0.5">
            {groups.slice(0, 5).map((group, index) => (
              <Link
                key={group.id}
                href={`/dashboard/groups/${group.id}`}
                className={navItemClass(isActive(pathname, `/dashboard/groups/${group.id}`))}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 shrink-0 rounded-full",
                    index === 0 ? "bg-primary" : "bg-muted-foreground/40",
                  )}
                />
                <span className="truncate">{group.name}</span>
              </Link>
            ))}
          </nav>
        </>
      )}

      <div className="mt-auto flex items-center gap-3 rounded-card border border-border bg-card p-3.5">
        <div className="relative h-11 w-11 shrink-0">
          <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90">
            <circle cx="22" cy="22" r={radius} fill="none" strokeWidth="3" className="stroke-secondary" />
            <circle
              cx="22"
              cy="22"
              r={radius}
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              className="stroke-primary transition-[stroke-dashoffset] duration-500 ease-out"
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center font-num text-[13px] font-semibold text-accent-fg">
            {level}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold">
            Level <span className="font-num">{level}</span>
          </p>
          <p className="text-[11.5px] text-muted-foreground">
            <span className="font-num">
              {xpInLevel} / {xpForNextLevel}
            </span>{" "}
            XP to Level <span className="font-num">{level + 1}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export function DashboardSidebar(props: DashboardSidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-border bg-background md:block">
      <SidebarContent {...props} />
    </aside>
  )
}
