"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createAssignmentWithOptions } from "@/lib/actions/assignments"
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Upload,
  X,
  FileText,
  ImageIcon,
  File,
  Sparkles,
  ListTodo,
  ArrowRight,
  AlertCircle,
  Flag,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format, addDays, nextFriday, addWeeks } from "date-fns"

interface CreateAssignmentWizardProps {
  groupId: string
  trigger?: React.ReactNode
}

type Priority = "low" | "medium" | "high" | "urgent"
type PlanningMethod = "ai" | "manual" | "later"

interface WizardData {
  title: string
  description: string
  priority: Priority
  deadline: string
  deadlineTime: string
  estimatedHours: number | null
  files: File[]
  links: string[]
  planningMethod: PlanningMethod
}

const PRIORITIES: { value: Priority; label: string; description: string; color: string }[] = [
  {
    value: "low",
    label: "Low",
    description: "No rush, flexible timeline",
    color: "bg-secondary text-muted-foreground hover:bg-secondary/70",
  },
  {
    value: "medium",
    label: "Medium",
    description: "Standard priority",
    color: "bg-secondary text-foreground hover:bg-secondary/70",
  },
  {
    value: "high",
    label: "High",
    description: "Important, needs attention",
    color: "bg-accent-soft text-accent-fg hover:bg-accent-soft/80",
  },
  {
    value: "urgent",
    label: "Urgent",
    description: "Critical deadline",
    color: "bg-danger/10 text-danger hover:bg-danger/20",
  },
]

const DEADLINE_PRESETS = [
  { label: "Tomorrow", getValue: () => addDays(new Date(), 1) },
  { label: "This Friday", getValue: () => nextFriday(new Date()) },
  { label: "Next Week", getValue: () => addWeeks(new Date(), 1) },
  { label: "2 Weeks", getValue: () => addWeeks(new Date(), 2) },
]

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />
  if (type.includes("pdf")) return <FileText className="h-4 w-4" />
  return <File className="h-4 w-4" />
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

export function CreateAssignmentWizard({ groupId, trigger }: CreateAssignmentWizardProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const [data, setData] = useState<WizardData>({
    title: "",
    description: "",
    priority: "medium",
    deadline: "",
    deadlineTime: "23:59",
    estimatedHours: null,
    files: [],
    links: [],
    planningMethod: "ai",
  })

  const [newLink, setNewLink] = useState("")

  const totalSteps = 4

  const resetWizard = () => {
    setStep(1)
    setError(null)
    setData({
      title: "",
      description: "",
      priority: "medium",
      deadline: "",
      deadlineTime: "23:59",
      estimatedHours: null,
      files: [],
      links: [],
      planningMethod: "ai",
    })
    setNewLink("")
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      resetWizard()
    }
  }

  // File upload handling
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setData((prev) => ({
      ...prev,
      files: [...prev.files, ...acceptedFiles],
    }))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const removeFile = (index: number) => {
    setData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }))
  }

  const addLink = () => {
    if (newLink.trim()) {
      setData((prev) => ({
        ...prev,
        links: [...prev.links, newLink.trim()],
      }))
      setNewLink("")
    }
  }

  const removeLink = (index: number) => {
    setData((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }))
  }

  const setDeadlinePreset = (date: Date) => {
    setData((prev) => ({
      ...prev,
      deadline: format(date, "yyyy-MM-dd"),
    }))
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.title.trim().length > 0
      case 2:
        return data.deadline.length > 0
      case 3:
        return true // Optional step
      case 4:
        return true
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Combine date and time
      const fullDeadline = `${data.deadline}T${data.deadlineTime}`

      const result = await createAssignmentWithOptions({
        groupId,
        title: data.title,
        description: data.description,
        deadline: fullDeadline,
        priority: data.priority,
        estimatedHours: data.estimatedHours,
        links: data.links,
        planningMethod: data.planningMethod,
      })

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      // Upload files if any
      if (data.files.length > 0 && result.assignmentId) {
        for (const file of data.files) {
          const formData = new FormData()
          formData.append("file", file)
          formData.append("assignmentId", result.assignmentId)

          await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })
        }
      }

      setOpen(false)
      resetWizard()
      router.push(`/dashboard/assignments/${result.assignmentId}`)
      router.refresh()
    } catch (err) {
      setError("An unexpected error occurred")
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Assignment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Assignment</DialogTitle>
          {/* Progress indicator */}
          <div className="flex items-center gap-2 pt-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={cn("h-1.5 flex-1 rounded-full transition-colors", i + 1 <= step ? "bg-primary" : "bg-muted")}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Step <span className="font-num">{step}</span> of <span className="font-num">{totalSteps}</span>
          </p>
        </DialogHeader>

        <div className="min-h-[320px] py-4">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Assignment Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Final Project Report"
                  value={data.title}
                  onChange={(e) => setData((prev) => ({ ...prev, title: e.target.value }))}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the assignment requirements, goals, and any specific instructions..."
                  value={data.description}
                  onChange={(e) => setData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="space-y-3">
                <Label>Priority</Label>
                <div className="grid grid-cols-2 gap-2">
                  {PRIORITIES.map((priority) => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() => setData((prev) => ({ ...prev, priority: priority.value }))}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all",
                        data.priority === priority.value
                          ? "border-primary bg-primary/5"
                          : "border-transparent " + priority.color,
                      )}
                    >
                      <Flag
                        className={cn(
                          "h-4 w-4",
                          priority.value === "urgent" && "text-danger",
                          priority.value === "high" && "text-accent-fg",
                          priority.value === "medium" && "text-muted-foreground",
                          priority.value === "low" && "text-muted-foreground/60",
                        )}
                      />
                      <div>
                        <p className="font-medium">{priority.label}</p>
                        <p className="text-xs text-muted-foreground">{priority.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Deadline & Schedule */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Quick Select</Label>
                <div className="flex flex-wrap gap-2">
                  {DEADLINE_PRESETS.map((preset) => (
                    <Button
                      key={preset.label}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDeadlinePreset(preset.getValue())}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Deadline Date *
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={data.deadline}
                    onChange={(e) => setData((prev) => ({ ...prev, deadline: e.target.value }))}
                    min={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={data.deadlineTime}
                    onChange={(e) => setData((prev) => ({ ...prev, deadlineTime: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedHours">Estimated Hours (optional)</Label>
                <p className="text-xs text-muted-foreground">How many hours do you think this assignment will take?</p>
                <Input
                  id="estimatedHours"
                  type="number"
                  min={1}
                  max={200}
                  placeholder="e.g., 10"
                  value={data.estimatedHours || ""}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      estimatedHours: e.target.value ? Number.parseInt(e.target.value) : null,
                    }))
                  }
                />
              </div>

              {data.deadline && (
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm">
                    <span className="font-medium">Deadline:</span>{" "}
                    {format(new Date(`${data.deadline}T${data.deadlineTime}`), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Attachments */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Upload Files</Label>
                <div
                  {...getRootProps()}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer",
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50",
                  )}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">{isDragActive ? "Drop files here" : "Drag & drop files here"}</p>
                  <p className="text-xs text-muted-foreground mt-1">or click to browse (max 10MB per file)</p>
                </div>
              </div>

              {data.files.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Files ({data.files.length})</Label>
                  <div className="space-y-2">
                    {data.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.type)}
                          <div>
                            <p className="text-sm font-medium truncate max-w-[300px]">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Add Resource Links</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://..."
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLink())}
                  />
                  <Button type="button" variant="secondary" onClick={addLink}>
                    Add
                  </Button>
                </div>
              </div>

              {data.links.length > 0 && (
                <div className="space-y-2">
                  {data.links.map((link, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg border p-2">
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-accent-fg hover:underline truncate max-w-[400px]"
                      >
                        {link}
                      </a>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeLink(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {data.files.length === 0 && data.links.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No attachments added yet. This step is optional - you can add files later.
                </p>
              )}
            </div>
          )}

          {/* Step 4: Planning Method */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">How would you like to plan this assignment?</p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setData((prev) => ({ ...prev, planningMethod: "ai" }))}
                  className={cn(
                    "w-full flex items-start gap-4 rounded-lg border-2 p-4 text-left transition-all",
                    data.planningMethod === "ai"
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50",
                  )}
                >
                  <div className="rounded-control bg-accent-soft p-2">
                    <Sparkles className="h-5 w-5 text-accent-fg" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">AI Auto-Plan</p>
                      <span className="rounded-chip bg-accent-soft px-2 py-0.5 text-xs text-accent-fg">
                        Recommended
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Let AI analyze your assignment and automatically create a task breakdown with time estimates
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setData((prev) => ({ ...prev, planningMethod: "manual" }))}
                  className={cn(
                    "w-full flex items-start gap-4 rounded-lg border-2 p-4 text-left transition-all",
                    data.planningMethod === "manual"
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50",
                  )}
                >
                  <div className="rounded-control bg-secondary p-2">
                    <ListTodo className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Manual Planning</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create and assign tasks yourself after the assignment is created
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setData((prev) => ({ ...prev, planningMethod: "later" }))}
                  className={cn(
                    "w-full flex items-start gap-4 rounded-lg border-2 p-4 text-left transition-all",
                    data.planningMethod === "later"
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50",
                  )}
                >
                  <div className="rounded-control bg-secondary p-2">
                    <ArrowRight className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Plan Later</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Just create the assignment now and decide on planning later
                    </p>
                  </div>
                </button>
              </div>

              {/* Summary */}
              <div className="rounded-lg bg-muted/50 p-4 mt-6">
                <h4 className="font-medium mb-2">Summary</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Title:</span> {data.title}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Priority:</span>{" "}
                    {PRIORITIES.find((p) => p.value === data.priority)?.label}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Deadline:</span>{" "}
                    {data.deadline &&
                      format(new Date(`${data.deadline}T${data.deadlineTime}`), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                  {data.estimatedHours && (
                    <p>
                      <span className="text-muted-foreground">Estimated:</span> {data.estimatedHours} hours
                    </p>
                  )}
                  {data.files.length > 0 && (
                    <p>
                      <span className="text-muted-foreground">Files:</span> {data.files.length} attached
                    </p>
                  )}
                  {data.links.length > 0 && (
                    <p>
                      <span className="text-muted-foreground">Links:</span> {data.links.length} added
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-control bg-danger/10 p-3 text-sm text-danger">
            <AlertCircle className="h-4 w-4" strokeWidth={1.75} />
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button type="button" variant="ghost" onClick={() => (step > 1 ? setStep(step - 1) : setOpen(false))}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            {step > 1 ? "Back" : "Cancel"}
          </Button>

          {step < totalSteps ? (
            <Button type="button" onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={isLoading || !canProceed()}>
              {isLoading ? "Creating..." : "Create Assignment"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
