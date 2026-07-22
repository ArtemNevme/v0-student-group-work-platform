"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Users, Loader2, CheckCircle2, ExternalLink } from "lucide-react"
import { importToStudySyncByGoogleId } from "@/lib/actions/google-classroom"
import { cn, cleanDisplayName } from "@/lib/utils"

interface Group {
  id: string
  name: string
}

interface ImportAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignment: {
    externalId: string
    title: string
    description?: string
    deadline?: string
    courseName?: string
  } | null
  userGroups: Group[]
}

export function ImportAssignmentDialog({ open, onOpenChange, assignment, userGroups }: ImportAssignmentDialogProps) {
  const router = useRouter()
  const [selectedGroup, setSelectedGroup] = useState<string>("")
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean
    assignmentId?: string
    error?: string
  } | null>(null)

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedGroup(userGroups.length > 0 ? userGroups[0].id : "")
      setImportResult(null)
    }
  }, [open, userGroups])

  const handleImport = async () => {
    if (!assignment || !selectedGroup) return

    setIsImporting(true)
    try {
      const result = await importToStudySyncByGoogleId(
        assignment.externalId,
        selectedGroup,
        assignment.title,
        assignment.description || "",
        assignment.deadline,
      )

      if (result.error) {
        setImportResult({ success: false, error: result.error })
      } else {
        setImportResult({ success: true, assignmentId: result.assignmentId })
      }
    } catch (error) {
      setImportResult({ success: false, error: "Failed to import assignment" })
    } finally {
      setIsImporting(false)
    }
  }

  const handleGoToAssignment = () => {
    if (importResult?.assignmentId) {
      router.push(`/dashboard/assignments/${importResult.assignmentId}`)
      onOpenChange(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    // Refresh the page to update the list
    if (importResult?.success) {
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {!importResult ? (
          <>
            <DialogHeader>
              <DialogTitle>Import Assignment</DialogTitle>
              <DialogDescription>
                Choose a group to import "{assignment?.title}" from Google Classroom
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {assignment?.courseName && (
                <div className="text-sm text-muted-foreground">
                  From: <span className="font-medium text-foreground">{assignment.courseName}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label>Select Group</Label>
                <RadioGroup value={selectedGroup} onValueChange={setSelectedGroup} className="space-y-2">
                  {userGroups.map((group) => (
                    <div
                      key={group.id}
                      className={cn(
                        "flex items-center space-x-3 rounded-lg border p-3 cursor-pointer transition-colors",
                        selectedGroup === group.id ? "border-primary bg-accent-soft" : "border-border hover:bg-secondary",
                      )}
                      onClick={() => setSelectedGroup(group.id)}
                    >
                      <RadioGroupItem value={group.id} id={group.id} />
                      <Label htmlFor={group.id} className="flex-1 cursor-pointer flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {cleanDisplayName(group.name)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {userGroups.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  You need to create or join a group first
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={!selectedGroup || isImporting}>
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  "Import"
                )}
              </Button>
            </DialogFooter>
          </>
        ) : importResult.success ? (
          <>
            <DialogHeader>
              <div className="mx-auto w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-success" strokeWidth={1.75} />
              </div>
              <DialogTitle className="text-center">Successfully Imported!</DialogTitle>
              <DialogDescription className="text-center">
                "{assignment?.title}" has been imported to your group
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
                Close
              </Button>
              <Button onClick={handleGoToAssignment} className="w-full sm:w-auto">
                <ExternalLink className="mr-2 h-4 w-4" />
                Go to Assignment
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-destructive">Import Failed</DialogTitle>
              <DialogDescription className="text-center">
                {importResult.error || "Something went wrong"}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={() => setImportResult(null)}>Try Again</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
