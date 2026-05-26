"use client"
import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RefreshCw, Archive } from "lucide-react"
import {
  Search,
  Clock,
  CheckCircle2,
  ExternalLink,
  Inbox,
  CalendarDays,
  AlertTriangle,
  Link2,
  ChevronDown,
  ChevronUp,
  Users,
  Plus,
  GraduationCap,
  Layers,
} from "lucide-react"
import { format, isToday, isTomorrow } from "date-fns"
import { cn } from "@/lib/utils"
import { completeAssignment } from "@/lib/actions/assignments"
import { toast } from "sonner"
import { ImportAssignmentDialog } from "@/components/my-tasks/import-assignment-dialog"
import { QuickCreateAssignmentDialog } from "@/components/my-tasks/quick-create-assignment-dialog"
import type { TaskItem } from "./page"

interface MyTasksClientProps {
  items: TaskItem[]
  sources: { id: string; name: string; type: "group" | "course" }[]
  archivedCount: number
  isGoogleConnected: boolean
  userGroups: { id: string; name: string }[]
  needsAutoSync: boolean
}

export function MyTasksClient({
  items,
  sources,
  archivedCount,
  isGoogleConnected,
  userGroups,
  needsAutoSync,
}: MyTasksClientProps) {
  const tasks = items || []
  const groups = userGroups || []

  const [sourceFilter, setSourceFilter] = useState<"all" | "studysync" | "google">("all")
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [sortBy, setSortBy] = useState<"subject" | "deadline">("deadline")
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false)
  const [authExpired, setAuthExpired] = useState(false)

  // Import dialog state
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<{
    externalId: string
    title: string
    description?: string
    deadline?: string
    courseName?: string
  } | null>(null)

  useEffect(() => {
    if (isGoogleConnected && needsAutoSync && !isSyncing && !authExpired) {
      performSync()
    }
  }, [isGoogleConnected, needsAutoSync])

  const performSync = async () => {
    setIsSyncing(true)

    try {
      const response = await fetch("/api/google-classroom/sync", {
        method: "POST",
      })

      const data = await response.json()

      if (data.error === "auth_expired") {
        setAuthExpired(true)
        toast.error("Google Classroom authorization expired")
        return
      }

      if (data.error) {
        console.error("Sync error:", data.error)
        return
      }

      if (data.synced > 0) {
        toast.success(`Synced ${data.synced} assignments from Google Classroom`)
      }
    } catch (error) {
      console.error("Sync failed:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleComplete = async (task: TaskItem) => {
    if (task.type !== "studysync" || !task.assignmentId) {
      toast.error("Can only complete StudySync tasks")
      return
    }

    try {
      const result = await completeAssignment(task.assignmentId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Task marked as complete!")
      }
    } catch (error) {
      toast.error("Failed to complete task")
    }
  }

  const handleImportClick = (task: TaskItem) => {
    if (!groups || groups.length === 0) {
      toast.error("You need to join or create a group first")
      return
    }

    if (!task.externalId) {
      toast.error("Cannot import this assignment - missing external ID")
      return
    }

    setSelectedAssignment({
      externalId: task.externalId,
      title: task.title,
      description: task.description || undefined,
      deadline: task.deadline || undefined,
      courseName: task.sourceName,
    })
    setImportDialogOpen(true)
  }

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return null

    const date = new Date(deadline)
    const now = new Date()
    const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (isToday(date)) {
      return { text: `Today, ${format(date, "HH:mm")}`, urgent: true }
    }
    if (isTomorrow(date)) {
      return { text: `Tomorrow, ${format(date, "HH:mm")}`, urgent: true }
    }
    if (diffDays < 0) {
      const daysAgo = Math.abs(diffDays)
      return { text: `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`, overdue: true }
    }
    if (diffDays <= 7) {
      return { text: format(date, "EEE, MMM d"), urgent: false }
    }
    return { text: format(date, "MMM d, yyyy"), urgent: false }
  }

  const toggleSection = (sectionName: string) => {
    setCollapsedGroups((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(sectionName)) {
        newSet.delete(sectionName)
      } else {
        newSet.add(sectionName)
      }
      return newSet
    })
  }

  const studySyncCount = tasks.filter((t) => t.type === "studysync" && !t.isCompleted).length
  const googleCount = tasks.filter((t) => t.type === "google" && !t.isCompleted).length

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (sourceFilter === "studysync" && task.type !== "studysync") return false
      if (sourceFilter === "google" && task.type !== "google") return false

      // Tab filter
      if (activeTab === "overdue") {
        if (!task.deadline || new Date(task.deadline) >= new Date() || task.isCompleted) return false
      } else if (activeTab === "upcoming") {
        if (!task.deadline || new Date(task.deadline) < new Date() || task.isCompleted) return false
      } else if (activeTab === "done") {
        if (!task.isCompleted) return false
      } else if (activeTab === "all") {
        // Don't show completed tasks in "all" tab by default
        if (task.isCompleted) return false
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!task.title.toLowerCase().includes(query) && !task.sourceName?.toLowerCase().includes(query)) {
          return false
        }
      }

      // Subject filter
      if (subjectFilter !== "all" && task.sourceName !== subjectFilter) {
        return false
      }

      return true
    })
  }, [tasks, sourceFilter, activeTab, searchQuery, subjectFilter])

  const groupedTasks = useMemo(() => {
    const grouped: Record<string, TaskItem[]> = {}

    const sortedTasks = [...filteredTasks].sort((a, b) => {
      if (sortBy === "deadline") {
        if (!a.deadline) return 1
        if (!b.deadline) return -1
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      }
      return (a.sourceName || "").localeCompare(b.sourceName || "")
    })

    for (const task of sortedTasks) {
      const key = task.sourceName || "Unknown"
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(task)
    }

    return grouped
  }, [filteredTasks, sortBy])

  // Get unique subjects for filter based on source filter
  const subjects = useMemo(() => {
    const filtered = sourceFilter === "all" ? tasks : tasks.filter((t) => t.type === sourceFilter)
    const uniqueSubjects = new Set(filtered.map((task) => task.sourceName).filter(Boolean))
    return Array.from(uniqueSubjects).sort()
  }, [tasks, sourceFilter])

  const allCount = tasks.filter((task) => !task.isCompleted).length
  const overdueCount = tasks.filter(
    (task) => task.deadline && new Date(task.deadline) < new Date() && !task.isCompleted,
  ).length
  const upcomingCount = tasks.filter(
    (task) => task.deadline && new Date(task.deadline) >= new Date() && !task.isCompleted,
  ).length
  const doneCount = tasks.filter((task) => task.isCompleted).length

  const tabsList = [
    { value: "all", label: "All", count: allCount, icon: Inbox },
    { value: "overdue", label: "Overdue", count: overdueCount, icon: Clock },
    { value: "upcoming", label: "Upcoming", count: upcomingCount, icon: CalendarDays },
    { value: "done", label: "Done", count: doneCount, icon: CheckCircle2 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tasks</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {allCount} active task{allCount !== 1 ? "s" : ""}
            {overdueCount > 0 && <span className="ml-1 text-red-600">({overdueCount} overdue)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {groups.length > 0 && (
            <QuickCreateAssignmentDialog groups={groups}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Assignment
              </Button>
            </QuickCreateAssignmentDialog>
          )}
          {isGoogleConnected && !authExpired && (
            <Button
              variant="outline"
              size="sm"
              onClick={performSync}
              disabled={isSyncing}
              className="gap-2 bg-transparent"
            >
              <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
              {isSyncing ? "Syncing..." : "Sync"}
            </Button>
          )}
        </div>
      </div>

      {/* Auth expired alert */}
      {authExpired && (
        <Alert variant="destructive" className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 dark:text-amber-200">Google Classroom Disconnected</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            <p className="mb-3">
              Your Google Classroom authorization has expired. Please reconnect to continue syncing assignments.
            </p>
            <Button asChild size="sm" variant="outline" className="gap-2 bg-transparent">
              <Link href="/dashboard/google-classroom">
                <Link2 className="h-4 w-4" />
                Reconnect Google Classroom
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Auto-sync indicator */}
      {isSyncing && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Syncing with Google Classroom...
        </div>
      )}

      {/* Archived notice */}
      {archivedCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          <Archive className="h-4 w-4" />
          {archivedCount} old task{archivedCount !== 1 ? "s" : ""} hidden (overdue by more than 60 days)
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
          <button
            onClick={() => setSourceFilter("all")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              sourceFilter === "all"
                ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200",
            )}
          >
            <Layers className="h-4 w-4" />
            All Sources
            <Badge variant="secondary" className="ml-1 text-xs">
              {allCount}
            </Badge>
          </button>
          <button
            onClick={() => setSourceFilter("studysync")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              sourceFilter === "studysync"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200",
            )}
          >
            <Users className="h-4 w-4" />
            StudySync
            <Badge
              variant="secondary"
              className={cn("ml-1 text-xs", sourceFilter === "studysync" ? "bg-blue-400 text-white" : "")}
            >
              {studySyncCount}
            </Badge>
          </button>
          <button
            onClick={() => setSourceFilter("google")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              sourceFilter === "google"
                ? "bg-green-500 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200",
            )}
          >
            <GraduationCap className="h-4 w-4" />
            Google Classroom
            <Badge
              variant="secondary"
              className={cn("ml-1 text-xs", sourceFilter === "google" ? "bg-green-400 text-white" : "")}
            >
              {googleCount}
            </Badge>
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 border-b dark:border-gray-700">
        {tabsList.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.value
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200",
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs",
                activeTab === tab.value
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject} value={subject || "unknown"}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as "subject" | "deadline")}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="deadline">Sort by Deadline</SelectItem>
            <SelectItem value="subject">Sort by Subject</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {sourceFilter !== "all" && (
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg px-4 py-3 text-sm",
            sourceFilter === "studysync"
              ? "bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200"
              : "bg-green-50 border border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200",
          )}
        >
          {sourceFilter === "studysync" ? (
            <>
              <Users className="h-5 w-5" />
              <div>
                <span className="font-medium">StudySync Assignments</span>
                <span className="ml-2 opacity-75">— Created by you or your group members on this platform</span>
              </div>
            </>
          ) : (
            <>
              <GraduationCap className="h-5 w-5" />
              <div>
                <span className="font-medium">Google Classroom Assignments</span>
                <span className="ml-2 opacity-75">— Synced from your Google Classroom courses</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Empty state with create button */}
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div
              className={cn(
                "rounded-full p-3 mb-4",
                sourceFilter === "google"
                  ? "bg-green-100 dark:bg-green-900"
                  : sourceFilter === "studysync"
                    ? "bg-blue-100 dark:bg-blue-900"
                    : "bg-green-100 dark:bg-green-900",
              )}
            >
              {sourceFilter === "google" ? (
                <GraduationCap className="h-8 w-8 text-green-600 dark:text-green-400" />
              ) : sourceFilter === "studysync" ? (
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              ) : (
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              )}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {activeTab === "done"
                ? "No completed tasks yet"
                : sourceFilter === "google"
                  ? "No Google Classroom assignments"
                  : sourceFilter === "studysync"
                    ? "No StudySync assignments"
                    : "All caught up!"}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center max-w-md">
              {activeTab === "done"
                ? "Complete some tasks to see them here"
                : sourceFilter === "google"
                  ? "Connect Google Classroom to sync your assignments"
                  : sourceFilter === "studysync"
                    ? "Create a new assignment to get started"
                    : "No pending tasks right now"}
            </p>
            {sourceFilter === "google" && !isGoogleConnected ? (
              <Button variant="outline" asChild className="bg-transparent">
                <Link href="/dashboard/google-classroom" className="gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Connect Google Classroom
                </Link>
              </Button>
            ) : sourceFilter === "studysync" && groups.length > 0 ? (
              <QuickCreateAssignmentDialog groups={groups}>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Plus className="h-4 w-4" />
                  Create Assignment
                </Button>
              </QuickCreateAssignmentDialog>
            ) : groups.length === 0 && sourceFilter !== "google" ? (
              <Button variant="outline" asChild className="bg-transparent">
                <Link href="/dashboard/groups">Join or create a group first</Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTasks).map(([subjectName, subjectTasks]) => {
            const isCollapsed = collapsedGroups.has(subjectName)
            const overdueInGroup = subjectTasks.filter(
              (t) => t.deadline && new Date(t.deadline) < new Date() && !t.isCompleted,
            ).length
            const isGoogle = subjectTasks[0]?.type === "google"

            return (
              <div key={subjectName} className="space-y-3">
                {/* Subject Header */}
                <button
                  onClick={() => toggleSection(subjectName)}
                  className="flex w-full items-center justify-between rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isGoogle ? (
                      <GraduationCap className="h-5 w-5 text-green-600" />
                    ) : (
                      <Users className="h-5 w-5 text-blue-600" />
                    )}
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{subjectName}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        isGoogle
                          ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
                          : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
                      )}
                    >
                      {isGoogle ? "Google Classroom" : "StudySync"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {subjectTasks.length} task{subjectTasks.length !== 1 ? "s" : ""}
                    </span>
                    {overdueInGroup > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {overdueInGroup} overdue
                      </Badge>
                    )}
                    {isCollapsed ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Tasks */}
                {!isCollapsed && (
                  <div className="space-y-2 pl-2">
                    {subjectTasks.map((task) => {
                      const deadline = formatDeadline(task.deadline)
                      const isGoogleTask = task.type === "google"

                      return (
                        <Card
                          key={task.id}
                          className={cn(
                            "transition-all hover:shadow-md",
                            isGoogleTask ? "border-l-4 border-l-green-500" : "border-l-4 border-l-blue-500",
                          )}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {/* Checkbox */}
                              <Checkbox
                                checked={task.isCompleted}
                                disabled={isGoogleTask}
                                onCheckedChange={() => handleComplete(task)}
                                className="mt-1"
                              />

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <h3
                                      className={cn(
                                        "font-medium text-gray-900 dark:text-gray-100",
                                        task.isCompleted && "line-through text-gray-500",
                                      )}
                                    >
                                      {task.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                      {deadline && (
                                        <span
                                          className={cn(
                                            "flex items-center gap-1 text-sm",
                                            deadline.overdue
                                              ? "text-red-600"
                                              : deadline.urgent
                                                ? "text-amber-600"
                                                : "text-gray-500",
                                          )}
                                        >
                                          <Clock className="h-3 w-3" />
                                          {deadline.text}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-2">
                                    {isGoogleTask && task.externalLink && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        asChild
                                        className="text-gray-500 hover:text-gray-700"
                                      >
                                        <a href={task.externalLink} target="_blank" rel="noopener noreferrer">
                                          <ExternalLink className="h-4 w-4" />
                                        </a>
                                      </Button>
                                    )}
                                    {isGoogleTask && !task.isImported && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleImportClick(task)}
                                        className="text-xs bg-transparent"
                                      >
                                        Import to StudySync
                                      </Button>
                                    )}
                                    {!isGoogleTask && task.assignmentId && (
                                      <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/dashboard/assignments/${task.assignmentId}`}>View</Link>
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Import dialog */}
      {selectedAssignment && (
        <ImportAssignmentDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          groups={groups}
          externalId={selectedAssignment.externalId}
          title={selectedAssignment.title}
          description={selectedAssignment.description}
          deadline={selectedAssignment.deadline}
          courseName={selectedAssignment.courseName}
        />
      )}
    </div>
  )
}
