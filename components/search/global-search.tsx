"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Search, FileText, Users, User, CheckCircle, Circle, Calendar, LayoutDashboard, ListTodo } from "lucide-react"
import { globalSearch, getRecentItems, type SearchResult } from "@/lib/actions/search"
import { useDebounce } from "@/hooks/use-debounce"

const iconMap: Record<string, React.ReactNode> = {
  "file-text": <FileText className="h-4 w-4" />,
  users: <Users className="h-4 w-4" />,
  user: <User className="h-4 w-4" />,
  "check-circle": <CheckCircle className="h-4 w-4 text-success" />,
  circle: <Circle className="h-4 w-4" />,
}

export function GlobalSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [recentItems, setRecentItems] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const debouncedQuery = useDebounce(query, 300)

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Load recent items when dialog opens
  useEffect(() => {
    if (open && recentItems.length === 0) {
      getRecentItems().then(setRecentItems)
    }
  }, [open, recentItems.length])

  // Search when query changes
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([])
      return
    }

    setIsLoading(true)
    globalSearch(debouncedQuery)
      .then(setResults)
      .finally(() => setIsLoading(false))
  }, [debouncedQuery])

  const handleSelect = useCallback(
    (url: string) => {
      setOpen(false)
      setQuery("")
      router.push(url)
    },
    [router],
  )

  const quickActions = [
    { label: "Go to Dashboard", url: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "View My Tasks", url: "/dashboard/my-tasks", icon: <ListTodo className="h-4 w-4" /> },
    { label: "View Groups", url: "/dashboard/groups", icon: <Users className="h-4 w-4" /> },
    { label: "Open Calendar", url: "/dashboard/calendar", icon: <Calendar className="h-4 w-4" /> },
  ]

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-[34px] w-9 items-center gap-2.5 rounded-control border border-border bg-card px-2.5 text-[13px] text-muted-foreground transition-colors duration-150 hover:bg-secondary sm:w-full sm:max-w-[320px]"
      >
        <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
        <span className="hidden truncate sm:inline">Search or command…</span>
        <kbd className="ml-auto hidden rounded border border-border bg-background px-1.5 py-0.5 font-num text-[11px] text-muted-foreground sm:inline-flex">
          Ctrl K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search tasks, assignments, groups..." value={query} onValueChange={setQuery} />
        <CommandList>
          <CommandEmpty>{isLoading ? "Searching..." : "No results found."}</CommandEmpty>

          {/* Search Results */}
          {results.length > 0 && (
            <CommandGroup heading="Search Results">
              {results.map((result) => (
                <CommandItem
                  key={`${result.type}-${result.id}`}
                  value={`${result.title} ${result.subtitle}`}
                  onSelect={() => handleSelect(result.url)}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    {result.icon ? (
                      iconMap[result.icon] || <FileText className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{result.title}</span>
                    <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                  </div>
                  <span className="ml-auto text-xs text-muted-foreground capitalize">{result.type}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Recent Items - show only when no search query */}
          {!query && recentItems.length > 0 && (
            <>
              <CommandGroup heading="Recent">
                {recentItems.map((item) => (
                  <CommandItem
                    key={`recent-${item.type}-${item.id}`}
                    value={`recent ${item.title}`}
                    onSelect={() => handleSelect(item.url)}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                      {item.icon ? (
                        iconMap[item.icon] || <FileText className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Quick Actions - show only when no search query */}
          {!query && (
            <CommandGroup heading="Quick Actions">
              {quickActions.map((action) => (
                <CommandItem
                  key={action.url}
                  value={action.label}
                  onSelect={() => handleSelect(action.url)}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">{action.icon}</div>
                  <span>{action.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
