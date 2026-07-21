"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Smile, Reply, Pencil, Trash2, X, Paperclip, Search } from "lucide-react"
import { sendMessage, editMessage, deleteMessage, addReaction, removeReaction } from "@/lib/actions/messages"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
}

interface Reaction {
  id: string
  emoji: string
  user_id: string
  profiles?: Profile
}

interface Message {
  id: string
  content: string
  created_at: string
  is_edited?: boolean
  is_deleted?: boolean
  user_id: string
  reply_to_id?: string | null
  attachment_url?: string | null
  attachment_type?: string | null
  profiles: Profile
  reply_to?: Message | null
  reactions?: Reaction[]
}

interface GroupMember {
  user_id: string
  profiles: Profile
}

interface GroupChatProps {
  groupId: string
  initialMessages: Message[]
  currentUserId: string
  members?: GroupMember[]
}

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "👏", "🎉"]

export function GroupChat({ groupId, initialMessages, currentUserId, members = [] }: GroupChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [editContent, setEditContent] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [mentionSearch, setMentionSearch] = useState<string | null>(null)
  const [mentionIndex, setMentionIndex] = useState(0)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  // Filter messages based on search
  const filteredMessages = searchQuery
    ? messages.filter((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages

  // Get mention suggestions
  const mentionSuggestions = mentionSearch
    ? members.filter(
        (m) => m.profiles.full_name?.toLowerCase().includes(mentionSearch.toLowerCase()) && m.user_id !== currentUserId,
      )
    : []

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  // Setup realtime subscriptions
  useEffect(() => {
    const setupRealtime = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.access_token) {
        supabase.realtime.setAuth(session.access_token)
      }

      const channel = supabase
        .channel(`group-chat:${groupId}`)
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState()
          const online = new Set<string>()
          const typing: string[] = []

          Object.values(state).forEach((presences: any) => {
            presences.forEach((presence: any) => {
              online.add(presence.user_id)
              if (presence.is_typing && presence.user_id !== currentUserId) {
                typing.push(presence.user_name || "Someone")
              }
            })
          })

          setOnlineUsers(online)
          setTypingUsers(typing)
        })
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `group_id=eq.${groupId}`,
          },
          async (payload) => {
            const { data } = await supabase
              .from("messages")
              .select(`
                *,
                profiles (id, full_name, avatar_url),
                reply_to:reply_to_id (
                  id, content, user_id,
                  profiles (id, full_name)
                )
              `)
              .eq("id", payload.new.id)
              .single()

            if (data) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === data.id)) return prev
                return [...prev, data as Message]
              })
            }
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "messages",
            filter: `group_id=eq.${groupId}`,
          },
          async (payload) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === payload.new.id
                  ? {
                      ...m,
                      content: payload.new.content,
                      is_edited: payload.new.is_edited,
                      is_deleted: payload.new.is_deleted,
                    }
                  : m,
              ),
            )
          },
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "message_reactions",
          },
          async (payload) => {
            if (payload.new && typeof payload.new === "object" && "message_id" in payload.new) {
              const messageId = payload.new.message_id
              const { data: reactions } = await supabase
                .from("message_reactions")
                .select("*, profiles (id, full_name)")
                .eq("message_id", messageId)

              setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, reactions: reactions || [] } : m)))
            }
          },
        )
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            const currentMember = members.find((m) => m.user_id === currentUserId)
            await channel.track({
              user_id: currentUserId,
              user_name: currentMember?.profiles.full_name || "User",
              is_typing: false,
              online_at: new Date().toISOString(),
            })
          }
        })

      return channel
    }

    const channelPromise = setupRealtime()

    return () => {
      channelPromise.then((channel) => {
        supabase.removeChannel(channel)
      })
    }
  }, [groupId, supabase, currentUserId, members])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleTyping = useCallback(async () => {
    const channel = supabase.channel(`group-chat:${groupId}`)
    const currentMember = members.find((m) => m.user_id === currentUserId)

    await channel.track({
      user_id: currentUserId,
      user_name: currentMember?.profiles.full_name || "User",
      is_typing: true,
      online_at: new Date().toISOString(),
    })

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(async () => {
      await channel.track({
        user_id: currentUserId,
        user_name: currentMember?.profiles.full_name || "User",
        is_typing: false,
        online_at: new Date().toISOString(),
      })
    }, 2000)
  }, [supabase, groupId, currentUserId, members])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewMessage(value)
    handleTyping()

    const lastAtIndex = value.lastIndexOf("@")
    if (lastAtIndex !== -1) {
      const textAfterAt = value.slice(lastAtIndex + 1)
      if (!textAfterAt.includes(" ")) {
        setMentionSearch(textAfterAt)
        setMentionIndex(0)
        return
      }
    }
    setMentionSearch(null)
  }

  const insertMention = (member: GroupMember) => {
    const lastAtIndex = newMessage.lastIndexOf("@")
    const newContent = newMessage.slice(0, lastAtIndex) + `@${member.profiles.full_name} `
    setNewMessage(newContent)
    setMentionSearch(null)
    inputRef.current?.focus()
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    const result = await sendMessage(groupId, newMessage.trim(), undefined, replyTo?.id)

    if (!result.error) {
      setNewMessage("")
      setReplyTo(null)
    }
    setIsSending(false)
  }

  const handleEdit = async () => {
    if (!editingMessage || !editContent.trim()) return

    const result = await editMessage(editingMessage.id, editContent.trim())
    if (result.success) {
      // Update local state immediately for better UX
      setMessages((prev) =>
        prev.map((m) => (m.id === editingMessage.id ? { ...m, content: editContent.trim(), is_edited: true } : m)),
      )
    }
    setEditingMessage(null)
    setEditContent("")
  }

  const handleDelete = async (messageId: string) => {
    const result = await deleteMessage(messageId)
    if (result.success) {
      // Update local state immediately for better UX
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, is_deleted: true } : m)))
    }
  }

  const handleAddReaction = async (messageId: string, emoji: string) => {
    await addReaction(messageId, emoji)
    setShowEmojiPicker(null)
  }

  const handleRemoveReaction = async (reactionId: string) => {
    await removeReaction(reactionId)
  }

  const groupReactions = (reactions: Reaction[] = []) => {
    const grouped: Record<string, { count: number; users: string[]; userReactionId?: string }> = {}
    reactions.forEach((r) => {
      if (!grouped[r.emoji]) {
        grouped[r.emoji] = { count: 0, users: [], userReactionId: undefined }
      }
      grouped[r.emoji].count++
      grouped[r.emoji].users.push(r.profiles?.full_name || "User")
      if (r.user_id === currentUserId) {
        grouped[r.emoji].userReactionId = r.id
      }
    })
    return grouped
  }

  return (
    <Card className="flex flex-col h-[600px] overflow-hidden">
      <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between py-3 px-4 border-b border-border">
        <div className="flex items-center gap-3">
          <CardTitle className="font-display text-[17px] font-medium tracking-[-0.01em] text-foreground">Group Chat</CardTitle>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="font-num text-xs text-muted-foreground">{onlineUsers.size} online</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setShowSearch(!showSearch)} className="h-8 w-8">
          <Search className="h-4 w-4" />
        </Button>
      </CardHeader>

      {showSearch && (
        <div className="flex-shrink-0 px-4 py-2 border-b border-border bg-secondary">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="pl-9 h-8"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs text-muted-foreground mt-1">Found <span className="font-num">{filteredMessages.length}</span> message(s)</p>
          )}
        </div>
      )}

      <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {filteredMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>{searchQuery ? "No messages found" : "No messages yet. Start the conversation!"}</p>
            </div>
          ) : (
            filteredMessages.map((message) => {
              const isOwnMessage = message.user_id === currentUserId
              const isDeleted = !!message.is_deleted
              const groupedReactions = groupReactions(message.reactions)

              return (
                <div key={message.id} className={cn("flex gap-3 group", isOwnMessage ? "flex-row-reverse" : "")}>
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    {message.profiles.avatar_url && (
                      <AvatarImage src={message.profiles.avatar_url || "/placeholder.svg"} />
                    )}
                    <AvatarFallback className="text-xs">{message.profiles.full_name?.[0] || "U"}</AvatarFallback>
                  </Avatar>

                  <div className={cn("flex flex-col max-w-[70%]", isOwnMessage ? "items-end" : "")}>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <span className="font-medium">{message.profiles.full_name || "Unknown"}</span>
                      <span>{formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}</span>
                      {message.is_edited && <span className="italic">(edited)</span>}
                    </div>

                    {message.reply_to && !isDeleted && (
                      <div
                        className={cn(
                          "text-xs px-2 py-1 rounded-chip mb-1 border-l-2",
                          isOwnMessage
                            ? "bg-accent-soft text-accent-fg border-accent-fg/40"
                            : "bg-secondary border-border",
                        )}
                      >
                        <span className="font-medium">{(message.reply_to as any).profiles?.full_name}</span>
                        <p className="truncate opacity-70">{message.reply_to.content}</p>
                      </div>
                    )}

                    <div
                      className={cn(
                        "rounded-control px-4 py-2 relative",
                        isDeleted
                          ? "bg-secondary text-muted-foreground italic"
                          : isOwnMessage
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-foreground",
                      )}
                    >
                      {isDeleted ? (
                        <p className="text-sm">This message was deleted</p>
                      ) : (
                        <>
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

                          {message.attachment_url && (
                            <div className="mt-2">
                              {message.attachment_type === "image" ? (
                                <img
                                  src={message.attachment_url || "/placeholder.svg"}
                                  alt="Attachment"
                                  className="max-w-full rounded-control max-h-60 object-cover"
                                />
                              ) : (
                                <a
                                  href={message.attachment_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-sm underline"
                                >
                                  <Paperclip className="h-4 w-4" />
                                  View attachment
                                </a>
                              )}
                            </div>
                          )}
                        </>
                      )}

                      {!isDeleted && (
                        <div
                          className={cn(
                            "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-1 bg-card rounded-control shadow-sm border border-border p-1",
                            isOwnMessage ? "left-0 -translate-x-full -ml-2" : "right-0 translate-x-full ml-2",
                          )}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)}
                          >
                            <Smile className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              setReplyTo(message)
                              inputRef.current?.focus()
                            }}
                          >
                            <Reply className="h-4 w-4" />
                          </Button>
                          {isOwnMessage && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                  setEditingMessage(message)
                                  setEditContent(message.content)
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => handleDelete(message.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      )}

                      {showEmojiPicker === message.id && (
                        <div
                          className={cn(
                            "absolute bottom-full mb-2 bg-card rounded-control shadow-sm border border-border p-2 flex gap-1 z-10",
                            isOwnMessage ? "right-0" : "left-0",
                          )}
                        >
                          {EMOJI_OPTIONS.map((emoji) => (
                            <button
                              key={emoji}
                              className="hover:bg-secondary p-1 rounded-chip text-lg transition-colors duration-150"
                              onClick={() => handleAddReaction(message.id, emoji)}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {Object.keys(groupedReactions).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(groupedReactions).map(([emoji, data]) => (
                          <button
                            key={emoji}
                            className={cn(
                              "flex items-center gap-1 px-2 py-0.5 rounded-chip text-xs border transition-colors duration-150",
                              data.userReactionId
                                ? "bg-accent-soft border-accent-fg/30 text-accent-fg"
                                : "bg-secondary border-transparent text-foreground hover:bg-secondary/70",
                            )}
                            onClick={() =>
                              data.userReactionId
                                ? handleRemoveReaction(data.userReactionId)
                                : handleAddReaction(message.id, emoji)
                            }
                            title={data.users.join(", ")}
                          >
                            <span>{emoji}</span>
                            <span className="font-num">{data.count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {typingUsers.length > 0 && (
          <div className="px-4 py-2 text-xs text-muted-foreground animate-pulse">
            {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
          </div>
        )}

        {/* Edit modal */}
        {editingMessage && (
          <div className="px-4 py-3 border-t border-border bg-secondary">
            <div className="flex items-center gap-2 mb-2">
              <Pencil className="h-4 w-4 text-accent-fg" strokeWidth={1.75} />
              <span className="text-sm font-medium">Edit message</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-auto"
                onClick={() => {
                  setEditingMessage(null)
                  setEditContent("")
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleEdit()
                  }
                }}
              />
              <Button onClick={handleEdit} size="sm">
                Save
              </Button>
            </div>
          </div>
        )}

        {replyTo && !editingMessage && (
          <div className="px-4 py-2 border-t border-border bg-secondary flex items-center gap-2">
            <Reply className="h-4 w-4 text-accent-fg" strokeWidth={1.75} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">{replyTo.profiles.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">{replyTo.content}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReplyTo(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {mentionSearch !== null && mentionSuggestions.length > 0 && (
          <div className="px-4 py-2 border-t border-border bg-card">
            <div className="flex flex-wrap gap-2">
              {mentionSuggestions.slice(0, 5).map((member, idx) => (
                <button
                  key={member.user_id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-control text-sm transition-colors duration-150",
                    idx === mentionIndex
                      ? "bg-accent-soft text-accent-fg"
                      : "bg-secondary text-foreground hover:bg-secondary/70",
                  )}
                  onClick={() => insertMention(member)}
                >
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-xs">{member.profiles.full_name?.[0]}</AvatarFallback>
                  </Avatar>
                  {member.profiles.full_name}
                </button>
              ))}
            </div>
          </div>
        )}

        {!editingMessage && (
          <form onSubmit={handleSend} className="flex-shrink-0 p-4 border-t border-border flex gap-2">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Type a message... (@ to mention)"
              disabled={isSending}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setReplyTo(null)
                  setMentionSearch(null)
                }
              }}
            />
            <Button type="submit" disabled={!newMessage.trim() || isSending} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
