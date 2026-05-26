"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Unplug } from "lucide-react"
import { disconnectGoogleClassroom } from "@/lib/actions/google-classroom"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function DisconnectButton() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect Google Classroom? All imported data will be removed.")) {
      return
    }

    try {
      setLoading(true)
      const result = await disconnectGoogleClassroom()

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Disconnected",
        description: "Google Classroom has been disconnected",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleDisconnect} disabled={loading} variant="destructive" className="gap-2">
      <Unplug className="h-4 w-4" />
      Disconnect
    </Button>
  )
}
