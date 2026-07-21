"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addAssignmentToTeam, getMyStudyTeams } from "@/lib/actions/assignments"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface AddToTeamDialogProps {
  assignment: {
    id: string
    title: string
    subject_id?: string | null
  }
}

export function AddToTeamDialog({ assignment }: AddToTeamDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [teams, setTeams] = useState<any[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string>("")

  useEffect(() => {
    if (open) {
      loadTeams()
    }
  }, [open])

  const loadTeams = async () => {
    const result = await getMyStudyTeams(assignment.subject_id)
    if (result.teams) {
      setTeams(result.teams)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeam) return

    setLoading(true)
    const result = await addAssignmentToTeam(assignment.id, selectedTeam)

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
    } else {
      toast.success("Assignment added to team!")
      setOpen(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add to Study Team
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Study Team</DialogTitle>
          <DialogDescription>
            Choose a Study Team to add this assignment. You'll be able to collaborate with your teammates on this
            assignment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team">Study Team</Label>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger id="team">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teams.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No teams available. Create a team in the subject page first.
                  </div>
                ) : (
                  teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedTeam || loading}>
              {loading ? "Adding..." : "Add to Team"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
