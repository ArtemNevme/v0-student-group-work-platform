"use client"

import Link from "next/link"
import { Users, ArrowRight } from "lucide-react"

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

// Generate consistent color based on group name
function getGroupColor(name: string): string {
  const colors = [
    "from-blue-500 to-blue-600",
    "from-violet-500 to-purple-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-amber-600",
    "from-pink-500 to-rose-600",
    "from-cyan-500 to-blue-600",
  ]
  const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[index % colors.length]
}

export function QuickAccessGroups({ groups }: QuickAccessGroupsProps) {
  if (groups.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 text-center">
        <Users className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No groups yet</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Create your first group to get started</p>
      </div>
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
          className="group relative rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 transition-all hover:shadow-md hover:-translate-y-0.5 overflow-hidden"
        >
          {/* Gradient accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getGroupColor(item.groups.name)}`} />

          <div className="flex flex-col h-full">
            <div
              className={`h-10 w-10 rounded-lg bg-gradient-to-br ${getGroupColor(item.groups.name)} flex items-center justify-center mb-3 shadow-md`}
            >
              <span className="text-white font-bold text-sm">{item.groups.name.substring(0, 2).toUpperCase()}</span>
            </div>

            <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate mb-1">{item.groups.name}</h4>

            {item.groups.subject && <span className="text-xs text-gray-400 truncate">{item.groups.subject}</span>}

            <ArrowRight className="h-4 w-4 text-gray-300 dark:text-gray-600 absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>
      ))}

      {remainingCount > 0 && (
        <Link
          href="/dashboard/groups"
          className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">+{remainingCount} more</span>
        </Link>
      )}
    </div>
  )
}
