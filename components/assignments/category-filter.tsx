"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  { value: "all", label: "All", color: "bg-gray-500" },
  { value: "project", label: "Project", color: "bg-blue-500" },
  { value: "homework", label: "Homework", color: "bg-green-500" },
  { value: "exam", label: "Exam", color: "bg-red-500" },
  { value: "presentation", label: "Presentation", color: "bg-purple-500" },
  { value: "lab", label: "Lab", color: "bg-orange-500" },
  { value: "other", label: "Other", color: "bg-gray-500" },
]

export function CategoryFilter() {
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const category = params.get("category")
    if (category) {
      setSelectedCategory(category)
    }
  }, [])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)

    // Update URL without page reload
    const url = new URL(window.location.href)
    if (category === "all") {
      url.searchParams.delete("category")
    } else {
      url.searchParams.set("category", category)
    }
    window.history.pushState({}, "", url)

    // Filter assignments in DOM
    const assignmentCards = document.querySelectorAll("[data-category]")
    assignmentCards.forEach((card) => {
      const cardCategory = card.getAttribute("data-category")
      const cardElement = card as HTMLElement
      if (category === "all" || cardCategory === category) {
        cardElement.style.display = ""
      } else {
        cardElement.style.display = "none"
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm font-medium text-gray-700">Filter by category:</span>
      {CATEGORIES.map((category) => (
        <Button
          key={category.value}
          variant={selectedCategory === category.value ? "default" : "outline"}
          size="sm"
          onClick={() => handleCategoryChange(category.value)}
          className={cn("gap-2", selectedCategory === category.value && "shadow-md")}
        >
          <div className={cn("h-3 w-3 rounded-full", category.color)} />
          {category.label}
        </Button>
      ))}
    </div>
  )
}
