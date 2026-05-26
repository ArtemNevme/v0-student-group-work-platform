"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ActivityHeatmapProps {
  activityMap: Record<string, number>
}

export function ActivityHeatmap({ activityMap }: ActivityHeatmapProps) {
  // Generate last 365 days
  const days: { date: string; count: number; dayOfWeek: number }[] = []
  const today = new Date()

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    days.push({
      date: dateStr,
      count: activityMap[dateStr] || 0,
      dayOfWeek: date.getDay(),
    })
  }

  // Group by weeks
  const weeks: (typeof days)[] = []
  let currentWeek: typeof days = []

  // Pad first week
  const firstDayOfWeek = days[0].dayOfWeek
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push({ date: "", count: 0, dayOfWeek: i })
  }

  days.forEach((day) => {
    currentWeek.push(day)
    if (day.dayOfWeek === 6) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })

  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  const getColor = (count: number) => {
    if (count === 0) return "bg-gray-100 dark:bg-gray-800"
    if (count === 1) return "bg-green-200 dark:bg-green-900"
    if (count === 2) return "bg-green-300 dark:bg-green-700"
    if (count <= 4) return "bg-green-400 dark:bg-green-600"
    return "bg-green-500 dark:bg-green-500"
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const totalActivity = Object.values(activityMap).reduce((sum, count) => sum + count, 0)

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const monthLabels: { month: string; weekIndex: number }[] = []
  let lastMonth = -1

  weeks.forEach((week, weekIndex) => {
    const firstValidDay = week.find((d) => d.date)
    if (firstValidDay) {
      const month = new Date(firstValidDay.date).getMonth()
      if (month !== lastMonth) {
        monthLabels.push({ month: months[month], weekIndex })
        lastMonth = month
      }
    }
  })

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Activity</CardTitle>
          <span className="text-sm text-muted-foreground">{totalActivity} tasks completed this year</span>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider delayDuration={0}>
          <div className="overflow-x-auto">
            {/* Month labels */}
            <div className="mb-1 flex text-xs text-muted-foreground" style={{ marginLeft: "20px" }}>
              {monthLabels.map(({ month, weekIndex }, idx) => (
                <span
                  key={idx}
                  style={{
                    position: "relative",
                    left: `${weekIndex * 12}px`,
                    marginRight:
                      idx < monthLabels.length - 1 ? `${(monthLabels[idx + 1].weekIndex - weekIndex - 3) * 12}px` : 0,
                  }}
                >
                  {month}
                </span>
              ))}
            </div>

            <div className="flex gap-0.5">
              {/* Day labels */}
              <div className="flex flex-col gap-0.5 text-xs text-muted-foreground pr-1">
                <span className="h-[10px]"></span>
                <span className="h-[10px] text-[9px] leading-[10px]">Mon</span>
                <span className="h-[10px]"></span>
                <span className="h-[10px] text-[9px] leading-[10px]">Wed</span>
                <span className="h-[10px]"></span>
                <span className="h-[10px] text-[9px] leading-[10px]">Fri</span>
                <span className="h-[10px]"></span>
              </div>

              {/* Weeks */}
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-0.5">
                  {week.map((day, dayIndex) => (
                    <Tooltip key={dayIndex}>
                      <TooltipTrigger asChild>
                        <div
                          className={`h-[10px] w-[10px] rounded-sm ${
                            day.date ? getColor(day.count) : "bg-transparent"
                          }`}
                        />
                      </TooltipTrigger>
                      {day.date && (
                        <TooltipContent side="top" className="text-xs">
                          <p className="font-medium">{day.count} tasks</p>
                          <p className="text-muted-foreground">{formatDate(day.date)}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-2 flex items-center justify-end gap-1 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-0.5">
                <div className="h-[10px] w-[10px] rounded-sm bg-gray-100 dark:bg-gray-800" />
                <div className="h-[10px] w-[10px] rounded-sm bg-green-200 dark:bg-green-900" />
                <div className="h-[10px] w-[10px] rounded-sm bg-green-300 dark:bg-green-700" />
                <div className="h-[10px] w-[10px] rounded-sm bg-green-400 dark:bg-green-600" />
                <div className="h-[10px] w-[10px] rounded-sm bg-green-500" />
              </div>
              <span>More</span>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
