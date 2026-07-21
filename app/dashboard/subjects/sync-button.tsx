"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useState } from "react"
import { syncGoogleClassroom } from "@/lib/actions/google-classroom"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function SyncSubjectsButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSync() {
    setLoading(true)

    try {
      const result = await syncGoogleClassroom()

      if (result.error) {
        if (result.error === "auth_expired") {
          toast.error("Session expired", {
            description: "Please reconnect to Google Classroom",
          })
        } else if (result.error === "not_connected") {
          toast.error("Not connected", {
            description: "Please connect to Google Classroom first",
          })
        } else {
          toast.error("Sync failed", {
            description: result.message || "Unknown error occurred",
          })
        }
      } else if (result.success) {
        const { stats, errors } = result

        toast.success("Sync complete!", {
          description: `${stats?.courses || 0} subjects, ${stats?.assignments || 0} assignments, ${stats?.materials || 0} materials`,
        })

        if (errors && errors.length > 0) {
          toast.warning("Some items had issues", {
            description: errors[0],
          })
        }

        router.refresh()
      }
    } catch (error) {
      toast.error("Sync failed", {
        description: "An unexpected error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleSync} disabled={loading} variant="outline">
      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Syncing..." : "Sync from Google Classroom"}
    </Button>
  )
}
