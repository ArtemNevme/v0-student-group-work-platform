"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Sparkles, Lightbulb, Plus } from "lucide-react"
import { createTask } from "@/lib/actions/tasks"
import { useRouter } from "next/navigation"

interface AITaskAssistantProps {
  assignmentId: string
  members: Array<{ user_id: string; profiles: { id: string; full_name: string } }>
}

interface Improvement {
  taskId: string | null
  type: "improve" | "add" | "split"
  suggestion: string
  newTask?: {
    title: string
    description: string
    estimatedHours: number
  }
}

interface SuggestedTask {
  title: string
  description: string
  estimatedHours: number
  rationale: string
}

export function AITaskAssistant({ assignmentId, members }: AITaskAssistantProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [action, setAction] = useState<"improve" | "suggest" | null>(null)
  const [improvements, setImprovements] = useState<{ improvements: Improvement[]; summary: string } | null>(null)
  const [suggestions, setSuggestions] = useState<SuggestedTask[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleAction = async (actionType: "improve" | "suggest") => {
    setLoading(true)
    setError(null)
    setAction(actionType)

    try {
      const response = await fetch("/api/improve-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId,
          action: actionType,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI assistance")
      }

      const data = await response.json()

      if (actionType === "improve") {
        setImprovements(data)
      } else {
        setSuggestions(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleAddSuggestion = async (task: SuggestedTask) => {
    try {
      // Assign to first member by default
      const result = await createTask(
        assignmentId,
        task.title,
        task.description,
        task.estimatedHours,
        members[0]?.user_id || "",
      )

      if (result.error) {
        throw new Error(result.error)
      }

      router.refresh()
      setOpen(false)
      setSuggestions([])
      setImprovements(null)
      setAction(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add task")
    }
  }

  const handleReset = () => {
    setAction(null)
    setImprovements(null)
    setSuggestions([])
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Sparkles className="mr-2 h-4 w-4" />
          AI Task Assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Task Assistant</DialogTitle>
          <DialogDescription>Get AI-powered help to improve your work plan</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Sparkles className="h-12 w-12 animate-spin text-accent-fg" strokeWidth={1.75} />
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">Please wait a moment...</p>
              <p className="text-sm text-muted-foreground mt-1">We're getting a response from the AI assistant</p>
            </div>
          </div>
        ) : !action ? (
          <div className="grid gap-4 py-4">
            <Button onClick={() => handleAction("improve")} disabled={loading} className="h-auto flex-col gap-2 py-4">
              <Lightbulb className="h-6 w-6" />
              <div>
                <div className="font-semibold">Analyze & Improve Tasks</div>
                <div className="text-xs font-normal opacity-80">Get suggestions to improve existing tasks</div>
              </div>
            </Button>

            <Button
              onClick={() => handleAction("suggest")}
              disabled={loading}
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
            >
              <Plus className="h-6 w-6" />
              <div>
                <div className="font-semibold">Suggest Additional Tasks</div>
                <div className="text-xs font-normal opacity-80">Get ideas for tasks you might be missing</div>
              </div>
            </Button>

            {error && (
              <div className="rounded-control bg-danger/10 p-3">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}
          </div>
        ) : action === "improve" && improvements ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Improvement Suggestions</h3>
              <Button variant="outline" size="sm" onClick={handleReset}>
                Back
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">{improvements.summary}</p>

            <div className="space-y-3">
              {improvements.improvements.map((improvement, index) => (
                <div key={index} className="rounded-card border border-border p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-chip bg-accent-soft px-2 py-1 text-xs font-medium text-accent-fg">
                      {improvement.type}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{improvement.suggestion}</p>
                  {improvement.newTask && (
                    <div className="mt-3 rounded-control bg-secondary p-3">
                      <h4 className="font-medium">{improvement.newTask.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{improvement.newTask.description}</p>
                      <p className="mt-1 text-xs text-muted-foreground"><span className="font-num">{improvement.newTask.estimatedHours}h</span> estimated</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : action === "suggest" && suggestions.length > 0 ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Suggested Tasks</h3>
              <Button variant="outline" size="sm" onClick={handleReset}>
                Back
              </Button>
            </div>

            <div className="space-y-3">
              {suggestions.map((task, index) => (
                <div key={index} className="rounded-card border border-border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        <span className="font-num">{task.estimatedHours}h</span> estimated • {task.rationale}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => handleAddSuggestion(task)}>
                      <Plus className="mr-1 h-3 w-3" />
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="rounded-control bg-danger/10 p-3">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
