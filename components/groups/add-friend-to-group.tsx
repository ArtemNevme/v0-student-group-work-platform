"use client"

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserPlus, Loader2 } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { getMyFriends } from "@/lib/actions/friends"
import { addFriendToGroup } from "@/lib/actions/groups"
import { toast } from "sonner"

interface AddFriendToGroupProps {
  groupId: string
}

export function AddFriendToGroup({ groupId }: AddFriendToGroupProps) {
  const [friends, setFriends] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadFriends()
    }
  }, [isOpen])

  async function loadFriends() {
    setIsLoading(true)
    const result = await getMyFriends()
    if (result.friends) {
      setFriends(result.friends)
    }
    setIsLoading(false)
  }

  async function handleAddFriend(friendId: string) {
    setIsAdding(friendId)
    const result = await addFriendToGroup(groupId, friendId)
    if (result.success) {
      toast.success("Friend added to group!")
      setIsOpen(false)
    } else if (result.error) {
      toast.error(result.error)
    }
    setIsAdding(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Friend
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Friend to Group</DialogTitle>
          <DialogDescription>Select a friend to add to this group (no confirmation needed)</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : friends.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              title="No friends yet"
              description="Add friends from your profile page first."
              className="border-none bg-transparent p-4"
            />
          ) : (
            friends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={friend.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{friend.full_name?.[0] || friend.email[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{friend.full_name || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">{friend.email}</p>
                  </div>
                </div>
                <Button size="sm" onClick={() => handleAddFriend(friend.id)} disabled={isAdding === friend.id}>
                  {isAdding === friend.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
