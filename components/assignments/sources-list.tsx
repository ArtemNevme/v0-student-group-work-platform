"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { BookOpen, Newspaper, FlaskConical, Video, LinkIcon, Plus, Trash2, ExternalLink } from "lucide-react"
import { addLink, deleteLink } from "@/lib/actions/files"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Source {
  id: string
  title: string
  url: string
  description: string | null
  category: string
  created_at: string
  profiles: {
    full_name: string
  }
}

interface SourcesListProps {
  assignmentId: string
  sources: Source[]
}

const categoryIcons = {
  news: Newspaper,
  book: BookOpen,
  scientific: FlaskConical,
  video: Video,
  ai_recommended: LinkIcon,
  other: LinkIcon,
}

const categoryLabels = {
  news: "News Article",
  book: "Book",
  scientific: "Scientific Article",
  video: "Video",
  ai_recommended: "AI Recommended",
  other: "Resource",
}

const categoryColors = {
  news: "bg-secondary text-muted-foreground",
  book: "bg-secondary text-muted-foreground",
  scientific: "bg-secondary text-muted-foreground",
  video: "bg-secondary text-muted-foreground",
  ai_recommended: "bg-accent-soft text-accent-fg",
  other: "bg-secondary text-muted-foreground",
}

export function SourcesList({ assignmentId, sources }: SourcesListProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("other")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const result = await addLink(assignmentId, title, url, description, category)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Source added successfully")
      setTitle("")
      setUrl("")
      setDescription("")
      setCategory("other")
      setIsOpen(false)
      router.refresh()
    }

    setIsSubmitting(false)
  }

  const handleDelete = async (sourceId: string) => {
    setDeletingId(sourceId)
    const result = await deleteLink(sourceId)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Source removed")
      router.refresh()
    }

    setDeletingId(null)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Sources & Resources (<span className="font-num">{sources.length}</span>)</CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Source
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Source</DialogTitle>
                <DialogDescription>Add a helpful resource or reference for this assignment</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Research Paper on Climate Change"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of this source..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="other">General Resource</option>
                    <option value="news">News Article</option>
                    <option value="book">Book</option>
                    <option value="scientific">Scientific Article</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Source"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {sources.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No sources added yet. Add helpful resources to support your work.
          </div>
        ) : (
          <div className="space-y-3">
            {sources.map((source) => {
              const Icon = categoryIcons[source.category as keyof typeof categoryIcons] || LinkIcon
              return (
                <div key={source.id} className="rounded-card border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="rounded-control bg-secondary p-2">
                        <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{source.title}</h4>
                          <Badge className={categoryColors[source.category as keyof typeof categoryColors]}>
                            {categoryLabels[source.category as keyof typeof categoryLabels]}
                          </Badge>
                        </div>
                        {source.description && <p className="text-sm text-muted-foreground mb-2">{source.description}</p>}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Added by {source.profiles.full_name}</span>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-accent-fg hover:underline"
                          >
                            Open link
                            <ExternalLink className="ml-1 h-3 w-3" strokeWidth={1.75} />
                          </a>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(source.id)}
                      disabled={deletingId === source.id}
                    >
                      <Trash2 className="h-4 w-4 text-danger" strokeWidth={1.75} />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
