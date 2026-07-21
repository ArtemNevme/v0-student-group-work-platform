"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { syncGoogleClassroom } from "@/lib/actions/google-classroom"
import { toast } from "sonner"

export function AutoSync() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const shouldSync = searchParams.get("autosync") === "true"

  useEffect(() => {
    if (!shouldSync) return

    const performAutoSync = async () => {
      const loadingToast = toast.loading("Syncing from Google Classroom...")

      try {
        const result = await syncGoogleClassroom()

        toast.dismiss(loadingToast)

        if (result.error) {
          toast.error("Sync failed", {
            description: result.message || "Please try syncing manually",
          })
        } else if (result.success) {
          const { stats } = result
          toast.success("Successfully synced!", {
            description: `Synced ${stats?.courses || 0} subjects, ${stats?.assignments || 0} assignments, and ${stats?.materials || 0} materials`,
            duration: 5000,
          })

          setTimeout(() => {
            window.location.reload()
          }, 1000)
        }
      } catch (error) {
        console.error("[v0] Auto-sync error:", error)
        toast.dismiss(loadingToast)
        toast.error("Sync failed", {
          description: "An unexpected error occurred",
        })
      } finally {
        const url = new URL(window.location.href)
        url.searchParams.delete("autosync")
        router.replace(url.pathname + url.search, { scroll: false })
      }
    }

    const timer = setTimeout(performAutoSync, 500)
    return () => clearTimeout(timer)
  }, [shouldSync, router])

  return null
}
