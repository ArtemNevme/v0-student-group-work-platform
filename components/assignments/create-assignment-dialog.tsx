"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createAssignment } from "@/lib/actions/assignments"
import { Plus } from "lucide-react"

interface CreateAssignmentDialogProps {
  groupId: string
  trigger?: React.ReactNode
}

export function CreateAssignmentDialog({ groupId, trigger }: CreateAssignmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.append("groupId", groupId)

    const result = await createAssignment(formData)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      setOpen(false)
      router.push(`/dashboard/assignments/${result.assignmentId}`)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Assignment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new assignment</DialogTitle>
          <DialogDescription>Add an assignment for your group to work on together.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" placeholder="e.g., Final Project Report" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the assignment requirements..."
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline *</Label>
            <Input id="deadline" name="deadline" type="datetime-local" required />
          </div>
          {error && (
            <div className="rounded-control bg-danger/10 p-3">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Assignment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
