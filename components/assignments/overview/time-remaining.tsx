"use client"

import { useState, useEffect } from "react"
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react"
import { differenceInDays, differenceInHours, differenceInMinutes, isPast, format } from "date-fns"

interface TimeRemainingProps {
  deadline: string
  status: string
  createdAt: string
}

export function TimeRemaining({ deadline, status, createdAt }: TimeRemainingProps) {
  const [mounted, setMounted] = useState(false)
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setMounted(true)
    setNow(new Date())

    const interval = setInterval(() => {
      setNow(new Date())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  if (!mounted || !now) {
    return null
  }

  const deadlineDate = new Date(deadline)
  const createdDate = new Date(createdAt)

  const isCompleted = status === "completed"

  const isOverdue = isPast(deadlineDate) && !isCompleted

  const totalDays = differenceInDays(deadlineDate, createdDate)
  const daysLeft = differenceInDays(deadlineDate, now)
  const hoursLeft = differenceInHours(deadlineDate, now) % 24
  const minutesLeft = differenceInMinutes(deadlineDate, now) % 60

  const timeElapsed = differenceInDays(now, createdDate)
  const timeProgress = totalDays > 0 ? Math.min(100, Math.max(0, (timeElapsed / totalDays) * 100)) : 100

  const formatTimeLeft = () => {
    if (isCompleted) {
      return "Completed"
    }

    if (isOverdue) {
      const overdueDays = Math.abs(daysLeft)
      const overdueHours = Math.abs(hoursLeft)
      if (overdueDays > 0) return `${overdueDays}d ${overdueHours}h overdue`
      if (overdueHours > 0) return `${overdueHours}h overdue`
      return `${Math.abs(minutesLeft)}m overdue`
    }

    if (daysLeft > 0) return `${daysLeft}d ${hoursLeft}h left`
    if (hoursLeft > 0) return `${hoursLeft}h ${minutesLeft}m left`
    return `${minutesLeft}m left`
  }

  const getStatusStyle = () => {
    if (isCompleted) {
      return {
        bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
        textColor: "text-emerald-600 dark:text-emerald-400",
        barColor: "bg-emerald-500",
        icon: CheckCircle2,
      }
    }
    if (isOverdue) {
      return {
        bgColor: "bg-red-50 dark:bg-red-900/20",
        textColor: "text-red-600 dark:text-red-400",
        barColor: "bg-red-500",
        icon: AlertTriangle,
      }
    }
    if (daysLeft <= 1) {
      return {
        bgColor: "bg-amber-50 dark:bg-amber-900/20",
        textColor: "text-amber-600 dark:text-amber-400",
        barColor: "bg-amber-500",
        icon: Clock,
      }
    }
    if (daysLeft <= 3) {
      return {
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
        textColor: "text-orange-600 dark:text-orange-400",
        barColor: "bg-orange-500",
        icon: Clock,
      }
    }
    return {
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      barColor: "bg-blue-500",
      icon: Clock,
    }
  }

  const style = getStatusStyle()
  const Icon = style.icon

  return (
    <div className={`rounded-xl p-4 ${style.bgColor}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`h-5 w-5 ${style.textColor}`} />
        <span className={`font-semibold ${style.textColor}`}>
          {isCompleted ? "Status" : isOverdue ? "Overdue" : "Time Left"}
        </span>
      </div>

      <p className={`text-2xl font-bold mb-1 ${style.textColor}`}>{formatTimeLeft()}</p>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Due: {format(deadlineDate, "MMM d, yyyy 'at' h:mm a")}
      </p>

      {!isCompleted && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Time elapsed</span>
            <span>{Math.round(timeProgress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${style.barColor} rounded-full transition-all duration-300`}
              style={{ width: `${timeProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
