"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, Code, Briefcase, GraduationCap, ArrowRight } from "lucide-react"
import { cleanDisplayName } from "@/lib/utils"

interface GroupCardProps {
  group: {
    id: string
    name: string
    description: string | null
    category: string | null
    member_count: number
  }
  role: string
}

const categoryIcons = {
  Law: GraduationCap,
  AI: Code,
  Marketing: Briefcase,
  default: BookOpen,
}

export function GroupCard({ group, role }: GroupCardProps) {
  const Icon = categoryIcons[group.category as keyof typeof categoryIcons] || categoryIcons.default

  return (
    <Link href={`/dashboard/groups/${group.id}`} className="group block h-full">
      <Card className="h-full transition-colors duration-150 hover:border-muted-foreground/40">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="rounded-control bg-secondary p-2.5">
              <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="font-display text-base font-medium tracking-[-0.01em] text-foreground truncate transition-colors duration-150 group-hover:text-accent-fg flex items-center gap-2">
                {cleanDisplayName(group.name)}
                <ArrowRight
                  className="h-4 w-4 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                  strokeWidth={1.75}
                />
              </CardTitle>
              {group.category && (
                <Badge variant="secondary" className="mt-2 bg-secondary text-muted-foreground border-0">
                  {group.category}
                </Badge>
              )}
            </div>
            {role === "admin" && (
              <Badge className="bg-accent-soft text-accent-fg border-0">
                Admin
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {group.description && (
            <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{group.description}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="mr-2 h-4 w-4" strokeWidth={1.75} />
              <span className="font-num font-medium">
                {group.member_count} {group.member_count === 1 ? "member" : "members"}
              </span>
            </div>
            <span className="rounded-chip bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
              Active
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
