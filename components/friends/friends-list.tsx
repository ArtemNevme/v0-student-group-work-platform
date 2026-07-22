"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UserPlus, Search, UserMinus, Loader2 } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { getMyFriends, searchUsers, addFriend, removeFriend } from "@/lib/actions/friends"
import { toast } from "sonner"

export function FriendsList() {
  const [friends, setFriends] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    loadFriends()
  }, [])

  async function loadFriends() {
    setIsLoading(true)
    const result = await getMyFriends()
    if (result.friends) {
      setFriends(result.friends)
    }
    setIsLoading(false)
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    const result = await searchUsers(searchQuery)
    if (result.users) {
      setSearchResults(result.users)
    } else if (result.error) {
      toast.error(result.error)
    }
    setIsSearching(false)
  }

  async function handleAddFriend(friendId: string) {
    const result = await addFriend(friendId)
    if (result.success) {
      toast.success("Friend added successfully!")
      setIsDialogOpen(false)
      setSearchQuery("")
      setSearchResults([])
      loadFriends()
    } else if (result.error) {
      toast.error(result.error)
    }
  }

  async function handleRemoveFriend(friendId: string) {
    const result = await removeFriend(friendId)
    if (result.success) {
      toast.success("Friend removed")
      loadFriends()
    } else if (result.error) {
      toast.error(result.error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>My Friends</CardTitle>
            <CardDescription>Manage your friends and add them to groups</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Friend
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Friend</DialogTitle>
                <DialogDescription>Search for users by email or name</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by email or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <div key={user.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>{user.full_name?.[0] || user.email[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.full_name || "Unknown"}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleAddFriend(user.id)}>
                        Add
                      </Button>
                    </div>
                  ))}
                  {searchResults.length === 0 && searchQuery && !isSearching && (
                    <p className="text-center text-sm text-muted-foreground">No users found</p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : friends.length === 0 ? (
          <EmptyState
            icon={UserPlus}
            title="No friends yet"
            description="Add some friends to get started."
            variant="card"
          />
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
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
                <Button size="sm" variant="ghost" onClick={() => handleRemoveFriend(friend.id)}>
                  <UserMinus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
