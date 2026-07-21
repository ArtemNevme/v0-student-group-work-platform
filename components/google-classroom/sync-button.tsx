"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function SyncGoogleClassroomButton() {
  const [syncing, setSyncing] = useState(false)
  const router = useRouter()

  const handleSync = async () => {
    try {
      setSyncing(true)

      const response = await fetch("/api/google-classroom/sync", {
        method: "POST",
      })

      if (!response.ok) {
        const text = await response.text()
        let errorData
        try {
          errorData = text ? JSON.parse(text) : {}
        } catch {
          errorData = { error: "Failed to sync" }
        }
        throw new Error(errorData.error || "Failed to sync")
      }

      const text = await response.text()
      const data = text ? JSON.parse(text) : {}

      toast.success(`Imported ${data.coursesCount || 0} courses and ${data.assignmentsCount || 0} assignments.`)

      router.refresh()
    } catch (error) {
      console.error("[v0] Error syncing Google Classroom:", error)
      toast.error(error instanceof Error ? error.message : "Failed to sync Google Classroom data. Please try again.")
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Button onClick={handleSync} disabled={syncing} variant="outline" className="gap-2 bg-transparent">
      <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
      {syncing ? "Syncing..." : "Sync Now"}
    </Button>
  )
}
