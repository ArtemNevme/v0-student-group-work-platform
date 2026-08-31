"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { GlobalSearch } from "@/components/search/global-search"
import { SidebarContent, type SidebarGroup } from "@/components/layout/dashboard-sidebar"

interface DashboardTopbarProps {
  groups: SidebarGroup[]
  level: number
  points: number
  fullName?: string | null
  avatarUrl?: string | null
}

export function DashboardTopbar({ groups, level, points, fullName, avatarUrl }: DashboardTopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background px-4 sm:px-6">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="grid h-9 w-9 place-items-center rounded-control border border-border bg-card text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" strokeWidth={1.75} />
        </button>

        <GlobalSearch />

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Link href="/dashboard/profile" aria-label="Profile">
            <Avatar className="h-8 w-8 border border-border">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName || "User"} />}
              <AvatarFallback className="bg-secondary text-xs font-semibold text-foreground">
                {fullName?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-60 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">Dashboard navigation menu</SheetDescription>
          <SidebarContent groups={groups} level={level} points={points} onItemClick={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
