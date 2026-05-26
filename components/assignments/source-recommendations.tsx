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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { BookOpen, Newspaper, FlaskConical, Video, LinkIcon, Sparkles } from "lucide-react"
import { addLink } from "@/lib/actions/files"
import { useRouter } from "next/navigation"

interface SourceRecommendationsProps {
  assignmentId: string
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

export function SourceRecommendations({ assignmentId }: SourceRecommendationsProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedSourceTypes, setSelectedSourceTypes] = useState<string[]>([])
  const [sources, setSources] = useState<Source[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleSourceTypeToggle = (typeId: string) => {
    setSelectedSourceTypes((prev) => (prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]))
  }

  const handleRecommend = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/recommend-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId,
          sourceTypes: selectedSourceTypes,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get recommendations")
      }

      const data = await response.json()
      setSources(data.sources)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAll = async () => {
    setSaving(true)
    setError(null)

    try {
      for (const source of sources) {
        await addLink(assignmentId, source.title, source.url, source.description, "ai_recommended")
      }
      setOpen(false)
      setSources([])
      setSelectedSourceTypes([])
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save sources")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Sparkles className="mr-2 h-4 w-4" />
          Get Source Recommendations
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Source Recommendations</DialogTitle>
          <DialogDescription>Get AI-powered recommendations for relevant sources for your assignment</DialogDescription>
        </DialogHeader>

        {sources.length === 0 ? (
          <div className="space-y-6 py-4">
            <div>
              <Label className="mb-3 block text-sm font-medium">What types of sources do you need?</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {sourceTypeOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`source-${option.id}`}
                        checked={selectedSourceTypes.includes(option.id)}
                        onCheckedChange={() => handleSourceTypeToggle(option.id)}
                      />
                      <Label
                        htmlFor={`source-${option.id}`}
                        className="flex cursor-pointer items-center gap-2 text-sm font-normal"
                      >
                        <Icon className="h-4 w-4 text-gray-500" />
                        {option.label}
                      </Label>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={handleRecommend} disabled={loading}>
                {loading ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Getting Recommendations...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get Recommendations
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">{sources.length} sources recommended</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSources([])}>
                  Try Again
                </Button>
                <Button size="sm" onClick={handleSaveAll} disabled={saving}>
                  {saving ? "Saving..." : "Save All Sources"}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {sources.map((source, index) => {
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

            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
