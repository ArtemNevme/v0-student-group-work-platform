"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sparkles, Check, X, BookOpen, Newspaper, FlaskConical, Video, LinkIcon, FileText } from "lucide-react"
import { saveWorkPlan } from "@/lib/actions/tasks"
import { addLink } from "@/lib/actions/files"
import { useRouter } from "next/navigation"

interface AIWorkPlannerProps {
  assignmentId: string
  files?: any[]
}

interface GeneratedTask {
  title: string
  description: string
  estimatedHours: number
  assignedMemberIndex: number
  assignedMember: {
    id: string
    full_name: string
    email: string
  }
}

interface Source {
  title: string
  url: string
  description: string
  category: "news" | "book" | "scientific" | "video" | "other"
}

const sourceTypeOptions = [
  { id: "news", label: "News Articles", icon: Newspaper },
  { id: "book", label: "Books", icon: BookOpen },
  { id: "scientific", label: "Scientific Articles", icon: FlaskConical },
  { id: "video", label: "Videos", icon: Video },
]

const categoryIcons = {
  news: Newspaper,
  book: BookOpen,
  scientific: FlaskConical,
  video: Video,
  other: LinkIcon,
}

export function AIWorkPlanner({ assignmentId, files = [] }: AIWorkPlannerProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSourceTypes, setSelectedSourceTypes] = useState<string[]>([])
  const [generatedPlan, setGeneratedPlan] = useState<{
    tasks: GeneratedTask[]
    rationale: string
    memberTaskCounts: number[]
    sources: Source[]
  } | null>(null)
  const router = useRouter()

  const handleSourceTypeToggle = (typeId: string) => {
    setSelectedSourceTypes((prev) => (prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-work-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId,
          sourceTypes: selectedSourceTypes,
          files: files.map((f) => ({
            name: f.file_name,
            type: f.file_type,
            url: f.file_url,
            size: f.file_size,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate work plan")
      }

      const data = await response.json()
      setGeneratedPlan(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAccept = async () => {
    if (!generatedPlan) return

    setIsSaving(true)
    setError(null)

    try {
      const tasksToSave = generatedPlan.tasks.map((task) => ({
        title: task.title,
        description: task.description,
        estimatedHours: task.estimatedHours,
        assignedMemberId: task.assignedMember.id,
      }))

      const result = await saveWorkPlan(assignmentId, tasksToSave)

      if (result.error) {
        throw new Error(result.error)
      }

      // Save recommended sources
      if (generatedPlan.sources && generatedPlan.sources.length > 0) {
        for (const source of generatedPlan.sources) {
          await addLink(assignmentId, source.title, source.url, source.description, "ai_recommended")
        }
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsSaving(false)
    }
  }

  const handleReject = () => {
    setGeneratedPlan(null)
  }

  if (generatedPlan) {
    const Icon = categoryIcons
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>AI-Generated Work Plan</CardTitle>
              <CardDescription className="mt-2">{generatedPlan.rationale}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleReject} variant="outline" size="sm" disabled={isSaving}>
                <X className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
              <Button onClick={handleAccept} size="sm" disabled={isSaving}>
                <Check className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Accept Plan"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Tasks */}
            <div>
              <h3 className="mb-3 font-semibold">Tasks</h3>
              <div className="space-y-4">
                {generatedPlan.tasks.map((task, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                          <span>{task.estimatedHours}h estimated</span>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {task.assignedMember.full_name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{task.assignedMember.full_name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Sources */}
            {generatedPlan.sources && generatedPlan.sources.length > 0 && (
              <div>
                <h3 className="mb-3 font-semibold">Recommended Sources</h3>
                <div className="space-y-3">
                  {generatedPlan.sources.map((source, index) => {
                    const SourceIcon = categoryIcons[source.category]
                    return (
                      <div key={index} className="rounded-lg border p-4">
                        <div className="flex items-start gap-3">
                          <div className="rounded-md bg-blue-50 p-2">
                            <SourceIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{source.title}</h4>
                            <p className="mt-1 text-sm text-gray-600">{source.description}</p>
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center text-sm text-blue-600 hover:underline"
                            >
                              View source
                              <LinkIcon className="ml-1 h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Work Planner</CardTitle>
        <CardDescription>
          Let AI analyze your assignment{files.length > 0 ? " and uploaded files" : ""} to create a balanced work plan
          for your team
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Show uploaded files */}
          {files.length > 0 && (
            <div className="rounded-lg border bg-blue-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-900">
                <FileText className="h-4 w-4" />
                Files to analyze ({files.length})
              </div>
              <div className="space-y-1">
                {files.map((file) => (
                  <div key={file.id} className="text-sm text-blue-700">
                    • {file.file_name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Source Type Selection */}
          <div>
            <Label className="mb-3 block text-sm font-medium">What types of sources do you need? (Optional)</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {sourceTypeOptions.map((option) => {
                const Icon = option.icon
                return (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={selectedSourceTypes.includes(option.id)}
                      onCheckedChange={() => handleSourceTypeToggle(option.id)}
                    />
                    <Label htmlFor={option.id} className="flex cursor-pointer items-center gap-2 text-sm font-normal">
                      <Icon className="h-4 w-4 text-gray-500" />
                      {option.label}
                    </Label>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center border-t pt-6 text-center">
            <div className="mb-4 rounded-full bg-blue-100 p-4">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="mb-2 font-semibold text-gray-900">Generate Work Plan</h3>
            <p className="mb-6 max-w-md text-sm text-gray-600">
              AI will {files.length > 0 ? "analyze your uploaded files, " : ""}break down your assignment into tasks,
              estimate time requirements, distribute work evenly across all team members, and recommend relevant sources
              based on your preferences
            </p>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Work Plan
                </>
              )}
            </Button>
            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
