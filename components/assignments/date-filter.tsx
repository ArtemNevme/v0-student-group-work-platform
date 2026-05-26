"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Calendar, Clock, CalendarDays, CalendarRange } from "lucide-react"

const DATE_FILTERS = [
  { value: "all", label: "All", icon: Calendar },
  { value: "today", label: "Today", icon: Clock },
  { value: "tomorrow", label: "Tomorrow", icon: CalendarDays },
  { value: "this-week", label: "This Week", icon: CalendarRange },
  { value: "next-week", label: "Next Week", icon: CalendarRange },
]

function isToday(date: Date) {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

function isTomorrow(date: Date) {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  )
}

function isThisWeek(date: Date) {
  const today = new Date()
  const endOfWeek = new Date(today)
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()))
  endOfWeek.setHours(23, 59, 59, 999)

  return date >= today && date <= endOfWeek
}

function isNextWeek(date: Date) {
  const today = new Date()
  const startOfNextWeek = new Date(today)
  startOfNextWeek.setDate(today.getDate() + (7 - today.getDay()) + 1)
  startOfNextWeek.setHours(0, 0, 0, 0)

  const endOfNextWeek = new Date(startOfNextWeek)
  endOfNextWeek.setDate(startOfNextWeek.getDate() + 6)
  endOfNextWeek.setHours(23, 59, 59, 999)

  return date >= startOfNextWeek && date <= endOfNextWeek
}

export function DateFilter() {
  const [selectedFilter, setSelectedFilter] = useState("all")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const filter = params.get("date")
    if (filter) {
      setSelectedFilter(filter)
    }
  }, [])

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter)

    // Update URL without page reload
    const url = new URL(window.location.href)
    if (filter === "all") {
      url.searchParams.delete("date")
    } else {
      url.searchParams.set("date", filter)
    }
    window.history.pushState({}, "", url)

    // Filter assignments in DOM
    const assignmentCards = document.querySelectorAll("[data-deadline]")
    assignmentCards.forEach((card) => {
      const deadline = card.getAttribute("data-deadline")
      const cardElement = card as HTMLElement

      if (filter === "all" || !deadline) {
        cardElement.style.display = ""
        return
      }

      const deadlineDate = new Date(deadline)
      let shouldShow = false

      switch (filter) {
        case "today":
          shouldShow = isToday(deadlineDate)
          break
        case "tomorrow":
          shouldShow = isTomorrow(deadlineDate)
          break
        case "this-week":
          shouldShow = isThisWeek(deadlineDate)
          break
        case "next-week":
          shouldShow = isNextWeek(deadlineDate)
          break
      }

      cardElement.style.display = shouldShow ? "" : "none"
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-white p-4 shadow-sm">
      <span className="text-sm font-medium text-gray-700">Filter by deadline:</span>
      {DATE_FILTERS.map((filter) => {
        const Icon = filter.icon
        return (
          <Button
            key={filter.value}
            variant={selectedFilter === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange(filter.value)}
            className={cn("gap-2 transition-all", selectedFilter === filter.value && "shadow-md")}
          >
            <Icon className="h-4 w-4" />
            {filter.label}
          </Button>
        )
      })}
    </div>
  )
}
