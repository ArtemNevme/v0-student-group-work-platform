"use client"

import { useState, type ReactNode } from "react"
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download } from "lucide-react"
import { importToStudySync } from "@/lib/actions/google-classroom"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { cleanDisplayName } from "@/lib/utils"

interface Group {
  id?: string
  groups?: {
    id: string
    name: string
  }
  name?: string
}

interface ImportedAssignment {
  id: string
  title: string
  description?: string | null
  due_date?: string | null
  alternate_link?: string | null
  imported_courses?: {
    name: string
  } | null
}

interface ImportToStudySyncDialogProps {
  // Support both old and new prop patterns
  assignmentId?: string
  assignmentTitle?: string
  assignment?: ImportedAssignment
  groups: Group[]
  trigger?: ReactNode
}

export function ImportToStudySyncDialog({
  assignmentId,
  assignmentTitle,
  assignment,
  groups,
  trigger,
}: ImportToStudySyncDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string>("")
  const [isImporting, setIsImporting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const id = assignment?.id || assignmentId || ""
  const title = assignment?.title || assignmentTitle || ""

  const handleImport = async () => {
    if (!selectedGroupId) {
      toast({
        title: "Error",
        description: "Please select a group",
        variant: "destructive",
      })
      return
    }

    setIsImporting(true)

    const result = await importToStudySync(id, selectedGroupId)

    if (result.error) {
      toast({
        title: "Import Failed",
        description: result.error,
        variant: "destructive",
      })
      setIsImporting(false)
    } else if ("assignmentId" in result && result.assignmentId) {
      toast({
        title: "Success!",
        description: "Assignment imported to StudySinc. You can now collaborate with your team.",
      })
      setOpen(false)
      setIsImporting(false)
      router.push(`/dashboard/assignments/${result.assignmentId}`)
    } else {
      setIsImporting(false)
    }
  }

  const normalizedGroups = groups
    .map((g) => ({
      id: g.groups?.id || g.id || "",
      name: g.groups?.name || g.name || "",
    }))
    .filter((g) => g.id && g.name)

  if (normalizedGroups.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Download className="mr-2 h-4 w-4" />
        No groups available
      </Button>
    )
  }

  const triggerElement = trigger || (
    <Button variant="outline" size="sm">
      <Download className="mr-2 h-4 w-4" />
      Import to StudySinc
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerElement}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import to StudySinc</DialogTitle>
          <DialogDescription>
            Convert &quot;{title}&quot; into a StudySinc project where you can collaborate with your team, create tasks,
            and track progress.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="group">Select Group</Label>
            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
              <SelectTrigger id="group">
                <SelectValue placeholder="Choose a group..." />
              </SelectTrigger>
              <SelectContent>
                {normalizedGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {cleanDisplayName(group.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              The assignment will be added to the selected group and all members will be able to collaborate on it.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isImporting}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isImporting}>
            {isImporting ? "Importing..." : "Import Assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
