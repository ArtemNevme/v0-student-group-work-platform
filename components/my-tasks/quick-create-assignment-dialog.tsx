"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createAssignmentWithOptions } from "@/lib/actions/assignments"
import { Loader2, Calendar, Users } from "lucide-react"
import { format, addDays, nextFriday, addWeeks } from "date-fns"
import { toast } from "sonner"

interface QuickCreateAssignmentDialogProps {
  groups: { id: string; name: string }[]
  children: React.ReactNode
}

const DEADLINE_PRESETS = [
  { label: "Tomorrow", getValue: () => addDays(new Date(), 1) },
  { label: "This Friday", getValue: () => nextFriday(new Date()) },
  { label: "Next Week", getValue: () => addWeeks(new Date(), 1) },
  { label: "2 Weeks", getValue: () => addWeeks(new Date(), 2) },
]

export function QuickCreateAssignmentDialog({ groups, children }: QuickCreateAssignmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    groupId: "",
    deadline: "",
    deadlineTime: "23:59",
  })

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      groupId: "",
      deadline: "",
      deadlineTime: "23:59",
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      resetForm()
    }
  }

  const setDeadlinePreset = (date: Date) => {
    setFormData((prev) => ({
      ...prev,
      deadline: format(date, "yyyy-MM-dd"),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error("Please enter a title")
      return
    }

    if (!formData.groupId) {
      toast.error("Please select a group")
      return
    }

    if (!formData.deadline) {
      toast.error("Please select a deadline")
      return
    }

    setIsLoading(true)

    try {
      const fullDeadline = `${formData.deadline}T${formData.deadlineTime}`

      const result = await createAssignmentWithOptions({
        groupId: formData.groupId,
        title: formData.title,
        description: formData.description,
        deadline: fullDeadline,
        priority: "medium",
        estimatedHours: null,
        links: [],
        planningMethod: "later",
      })

      if (result.error) {
        toast.error(result.error)
        setIsLoading(false)
        return
      }

      toast.success("Assignment created!")
      setOpen(false)
      resetForm()
      router.push(`/dashboard/assignments/${result.assignmentId}`)
      router.refresh()
    } catch (error) {
      toast.error("Failed to create assignment")
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Assignment</DialogTitle>
          <DialogDescription>Quickly create a new assignment for one of your groups.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group">
              <Users className="h-4 w-4 inline mr-2" />
              Group *
            </Label>
            <Select
              value={formData.groupId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, groupId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Final Project Report"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the assignment..."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>
              <Calendar className="h-4 w-4 inline mr-2" />
              Deadline *
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {DEADLINE_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDeadlinePreset(preset.getValue())}
                  className="bg-transparent"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
                min={format(new Date(), "yyyy-MM-dd")}
              />
              <Input
                type="time"
                value={formData.deadlineTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, deadlineTime: e.target.value }))}
              />
            </div>
            {formData.deadline && (
              <p className="text-sm text-muted-foreground mt-1">
                Due:{" "}
                {format(new Date(`${formData.deadline}T${formData.deadlineTime}`), "EEEE, MMMM d, yyyy 'at' h:mm a")}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Assignment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
