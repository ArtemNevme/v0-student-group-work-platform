"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ReconnectGoogleClassroomButtonProps {
  variant?: "default" | "outline" | "secondary"
  size?: "default" | "sm" | "lg"
}

export function ReconnectGoogleClassroomButton({
  variant = "outline",
  size = "default",
}: ReconnectGoogleClassroomButtonProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleReconnect = async () => {
    try {
      setLoading(true)

      const response = await fetch("/api/google-classroom/auth-url")
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      toast({
        title: "Reconnecting...",
        description: "You'll be redirected to Google to grant updated permissions.",
      })

      window.location.href = data.authUrl
    } catch (error) {
      console.error("Error reconnecting Google Classroom:", error)
      toast({
        title: "Reconnection Failed",
        description: "Failed to reconnect. Please try again.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleReconnect} disabled={loading} variant={variant} size={size} className="gap-2">
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Reconnecting...
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4" />
          Reconnect Google Classroom
        </>
      )}
    </Button>
  )
}
