"use client"

import { AlertTriangle, ArrowUp, Minus, ArrowDown } from "lucide-react"

interface PriorityBadgeProps {
  priority: "low" | "medium" | "high" | "urgent" | string | null
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
}

export function PriorityBadge({ priority, showLabel = true, size = "md" }: PriorityBadgeProps) {
  const getPriorityConfig = () => {
    switch (priority) {
      case "urgent":
        return {
          label: "Urgent",
          icon: AlertTriangle,
          bgColor: "bg-red-100 dark:bg-red-900/30",
          textColor: "text-red-700 dark:text-red-400",
          iconColor: "text-red-500",
        }
      case "high":
        return {
          label: "High",
          icon: ArrowUp,
          bgColor: "bg-orange-100 dark:bg-orange-900/30",
          textColor: "text-orange-700 dark:text-orange-400",
          iconColor: "text-orange-500",
        }
      case "medium":
        return {
          label: "Medium",
          icon: Minus,
          bgColor: "bg-blue-100 dark:bg-blue-900/30",
          textColor: "text-blue-700 dark:text-blue-400",
          iconColor: "text-blue-500",
        }
      case "low":
        return {
          label: "Low",
          icon: ArrowDown,
          bgColor: "bg-gray-100 dark:bg-gray-800",
          textColor: "text-gray-700 dark:text-gray-400",
          iconColor: "text-gray-500",
        }
      default:
        return {
          label: "Normal",
          icon: Minus,
          bgColor: "bg-gray-100 dark:bg-gray-800",
          textColor: "text-gray-700 dark:text-gray-400",
          iconColor: "text-gray-500",
        }
    }
  }

  const config = getPriorityConfig()
  const Icon = config.icon

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-sm gap-1.5",
    lg: "px-4 py-1.5 text-base gap-2",
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <div
      className={`inline-flex items-center rounded-full font-medium ${config.bgColor} ${config.textColor} ${sizeClasses[size]}`}
    >
      <Icon className={`${iconSizes[size]} ${config.iconColor}`} />
      {showLabel && <span>{config.label}</span>}
    </div>
  )
}
