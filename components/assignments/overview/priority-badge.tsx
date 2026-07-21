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
          bgColor: "bg-danger/10",
          textColor: "text-danger",
          iconColor: "text-danger",
        }
      case "high":
        return {
          label: "High",
          icon: ArrowUp,
          bgColor: "bg-accent-soft",
          textColor: "text-accent-fg",
          iconColor: "text-accent-fg",
        }
      case "medium":
        return {
          label: "Medium",
          icon: Minus,
          bgColor: "bg-secondary",
          textColor: "text-muted-foreground",
          iconColor: "text-muted-foreground",
        }
      case "low":
        return {
          label: "Low",
          icon: ArrowDown,
          bgColor: "bg-secondary",
          textColor: "text-muted-foreground",
          iconColor: "text-muted-foreground",
        }
      default:
        return {
          label: "Normal",
          icon: Minus,
          bgColor: "bg-secondary",
          textColor: "text-muted-foreground",
          iconColor: "text-muted-foreground",
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
      className={`inline-flex items-center rounded-chip font-medium ${config.bgColor} ${config.textColor} ${sizeClasses[size]}`}
    >
      <Icon className={`${iconSizes[size]} ${config.iconColor}`} strokeWidth={1.75} />
      {showLabel && <span>{config.label}</span>}
    </div>
  )
}
