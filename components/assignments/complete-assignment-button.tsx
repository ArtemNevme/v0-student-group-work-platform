"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { completeAssignment } from "@/lib/actions/assignments"
import { CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
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

interface CompleteAssignmentButtonProps {
  assignmentId: string
  status: string
}

export function CompleteAssignmentButton({ assignmentId, status }: CompleteAssignmentButtonProps) {
  const router = useRouter()
  const [completing, setCompleting] = useState(false)

  if (status === "completed") {
    return (
      <div className="flex items-center gap-2 text-success">
        <CheckCircle2 className="h-5 w-5" strokeWidth={1.75} />
        <span className="font-medium">Completed</span>
      </div>
    )
  }

  const handleComplete = async () => {
    setCompleting(true)
    const result = await completeAssignment(assignmentId)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Assignment marked as completed!")
    }

    setCompleting(false)
    router.refresh()
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="border-success/40 text-success hover:bg-success/10 hover:text-success bg-transparent">
          <CheckCircle2 className="mr-2 h-4 w-4" strokeWidth={1.75} />
          Mark as Completed
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Complete Assignment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to mark this assignment as completed? This will indicate that all work on this
            assignment is finished.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleComplete} disabled={completing}>
            {completing ? "Completing..." : "Yes, Complete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
