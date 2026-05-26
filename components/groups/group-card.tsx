"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, Code, Briefcase, GraduationCap, ArrowRight } from "lucide-react"
import { useState } from "react"

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

const categoryConfig = {
  Law: {
    color: "from-blue-500 to-blue-600",
    icon: GraduationCap,
    badge: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
  },
  AI: {
    color: "from-violet-500 to-purple-600",
    icon: Code,
    badge: "bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300",
  },
  Marketing: {
    color: "from-amber-500 to-orange-600",
    icon: Briefcase,
    badge: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300",
  },
  default: {
    color: "from-gray-500 to-gray-600",
    icon: BookOpen,
    badge: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
  },
}

export function GroupCard({ group, role }: GroupCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const config = categoryConfig[group.category as keyof typeof categoryConfig] || categoryConfig.default
  const Icon = config.icon

  return (
    <Link
      href={`/dashboard/groups/${group.id}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-2 border-gray-100 dark:border-gray-800 h-full relative overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
        />

        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-start justify-between gap-3">
            <div
              className={`rounded-xl bg-gradient-to-br ${config.color} p-3 shadow-md transition-transform duration-300 ${isHovered ? "scale-110 rotate-3" : ""}`}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
                {group.name}
                <ArrowRight
                  className={`h-4 w-4 transition-all duration-300 ${isHovered ? "translate-x-1 opacity-100" : "translate-x-0 opacity-0"}`}
                />
              </CardTitle>
              {group.category && (
                <Badge variant="secondary" className={`mt-2 ${config.badge} border-0`}>
                  {group.category}
                </Badge>
              )}
            </div>
            {role === "admin" && (
              <Badge className="bg-gradient-to-r from-blue-600 to-violet-600 text-white border-0 shadow-sm">
                Admin
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          {group.description && (
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{group.description}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Users className="mr-2 h-4 w-4" />
              <span className="font-medium">
                {group.member_count} {group.member_count === 1 ? "member" : "members"}
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full font-medium">
              Active
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
