"use client"

import Link from "next/link"
import { Users, ArrowRight } from "lucide-react"
import { cleanDisplayName } from "@/lib/utils"
import { EmptyState } from "@/components/ui/empty-state"

interface Group {
  groups: {
    id: string
    name: string
    description: string | null
    subject: string | null
  }
  role: string
}

interface QuickAccessGroupsProps {
  groups: Group[]
}

export function QuickAccessGroups({ groups }: QuickAccessGroupsProps) {
  if (groups.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No groups yet"
        description="Create your first group to start collaborating with classmates."
        action={{ label: "Create group", href: "/dashboard/groups" }}
      />
    )
  }

  const displayGroups = groups.slice(0, 4)
  const remainingCount = groups.length - 4

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {displayGroups.map((item) => (
        <Link
          key={item.groups.id}
          href={`/dashboard/groups/${item.groups.id}`}
          className="group relative rounded-card border border-border bg-card p-4 transition-colors duration-150 hover:bg-secondary"
        >
          <div className="flex flex-col h-full">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-control bg-secondary border border-border">
              <span className="font-display text-sm font-semibold text-foreground">
                {cleanDisplayName(item.groups.name).substring(0, 2).toUpperCase()}
              </span>
            </div>

            <h4 className="font-medium text-foreground text-sm truncate mb-1">{cleanDisplayName(item.groups.name)}</h4>

            {item.groups.subject && <span className="text-xs text-muted-foreground truncate">{item.groups.subject}</span>}

            <ArrowRight className="h-4 w-4 text-muted-foreground absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>
      ))}

      {remainingCount > 0 && (
        <Link
          href="/dashboard/groups"
          className="rounded-card border border-border bg-card p-4 flex items-center justify-center transition-colors duration-150 hover:bg-secondary"
        >
          <span className="text-sm font-medium text-muted-foreground">
            +<span className="font-num">{remainingCount}</span> more
          </span>
        </Link>
      )}
    </div>
  )
}
