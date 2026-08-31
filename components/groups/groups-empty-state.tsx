"use client"

import { Users, Plus } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { CreateGroupDialog } from "./create-group-dialog"

interface GroupsEmptyStateProps {
  subjects: Array<{
    id: string
    name: string
    icon: string | null
  }>
}

export function GroupsEmptyState({ subjects }: GroupsEmptyStateProps) {
  return (
    <EmptyState
      icon={Users}
      title="No groups yet"
      description="Create your first group to start collaborating with classmates on assignments."
      action={
        <CreateGroupDialog subjects={subjects}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            Create your first group
          </Button>
        </CreateGroupDialog>
      }
    />
  )
}
