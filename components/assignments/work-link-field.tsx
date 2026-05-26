"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, Edit2, Check, X } from "lucide-react"
import { updateWorkLink } from "@/lib/actions/assignments"
import { useRouter } from "next/navigation"

interface WorkLinkFieldProps {
  assignmentId: string
  initialWorkLink?: string | null
}

export function WorkLinkField({ assignmentId, initialWorkLink }: WorkLinkFieldProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [workLink, setWorkLink] = useState(initialWorkLink || "")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    const result = await updateWorkLink(assignmentId, workLink)
    setIsSaving(false)

    if (result.error) {
      alert(result.error)
      return
    }

    setIsEditing(false)
    router.refresh()
  }

  const handleCancel = () => {
    setWorkLink(initialWorkLink || "")
    setIsEditing(false)
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <ExternalLink className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700">Work Document Link</label>
            {isEditing ? (
              <div className="mt-1 flex items-center gap-2">
                <Input
                  type="url"
                  value={workLink}
                  onChange={(e) => setWorkLink(e.target.value)}
                  placeholder="https://docs.google.com/document/..."
                  className="flex-1 bg-white"
                />
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel} disabled={isSaving}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="mt-1 flex items-center gap-2">
                {workLink ? (
                  <>
                    <a
                      href={workLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 truncate text-sm text-blue-600 hover:underline"
                    >
                      {workLink}
                    </a>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="flex-1 text-sm text-gray-500">No work document link added yet</p>
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Add Link
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
