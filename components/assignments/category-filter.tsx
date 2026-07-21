"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "project", label: "Project" },
  { value: "homework", label: "Homework" },
  { value: "exam", label: "Exam" },
  { value: "presentation", label: "Presentation" },
  { value: "lab", label: "Lab" },
  { value: "other", label: "Other" },
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
      <span className="text-sm font-medium text-foreground">Filter by category:</span>
      {CATEGORIES.map((category) => (
        <Button
          key={category.value}
          variant={selectedCategory === category.value ? "default" : "outline"}
          size="sm"
          onClick={() => handleCategoryChange(category.value)}
          className="gap-2"
        >
          <div className="h-2.5 w-2.5 rounded-full bg-current opacity-50" />
          {category.label}
        </Button>
      ))}
    </div>
  )
}
