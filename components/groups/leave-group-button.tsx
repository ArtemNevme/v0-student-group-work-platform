"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { leaveGroup } from "@/lib/actions/groups"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { LogOut } from "lucide-react"

interface LeaveGroupButtonProps {
  groupId: string
  groupName: string
}

export function LeaveGroupButton({ groupId, groupName }: LeaveGroupButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLeave = async () => {
    setIsLoading(true)
    console.log("[v0] Attempting to leave group:", groupId)

    try {
      const result = await leaveGroup(groupId)
      console.log("[v0] Leave group result:", result)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        setIsLoading(false)
        setIsOpen(false)
        return
      }

      toast({
        title: "Left group",
        description: `You have left ${groupName}`,
      })

      // Redirect to dashboard after successful leave
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error leaving group:", error)
      toast({
        title: "Error",
        description: "Failed to leave group. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
      setIsOpen(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <LogOut className="mr-2 h-4 w-4" />
          Leave Group
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave {groupName}?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to leave this group? You will lose access to all assignments, messages, and group
            content. You can only rejoin if invited again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleLeave} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
            {isLoading ? "Leaving..." : "Leave Group"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
