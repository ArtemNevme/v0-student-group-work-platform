"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ConnectGoogleClassroomButton() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleConnect = async () => {
    try {
      setLoading(true)

      const response = await fetch("/api/google-classroom/auth-url")
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Redirect to Google OAuth
      window.location.href = data.authUrl
    } catch (error) {
      console.error("[v0] Error connecting Google Classroom:", error)
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Google Classroom. Please try again.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleConnect} disabled={loading} size="lg" className="gap-2">
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <ExternalLink className="h-4 w-4" />
          Connect Google Classroom
        </>
      )}
    </Button>
  )
}
