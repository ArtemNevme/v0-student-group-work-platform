"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { updateTaskStatus, deleteTask } from "@/lib/actions/tasks"
import { completeAssignment } from "@/lib/actions/assignments"
import { EditTaskDialog } from "@/components/assignments/edit-task-dialog"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Trash2,
  CheckCircle2,
  PartyPopper,
  Search,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Clock,
  User,
  Play,
  Check,
  GripVertical,
} from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface Task {
  id: string
  title: string
  description: string | null
  estimated_hours: number | null
  status: string
  task_assignments: Array<{
    id: string
    user_id: string
    status: string
    profiles: {
      id: string
      full_name: string | null
    }
  }>
}

interface TaskListProps {
  tasks: Task[]
  currentUserId: string
  members: Array<{
    user_id: string
    profiles: {
      id: string
      full_name: string
    }
  }>
  assignmentId: string
  assignmentStatus: string
}

type FilterType = "all" | "my_tasks"
type SortType = "status" | "assignee" | "hours"

export function TaskList({ tasks, currentUserId, members, assignmentId, assignmentStatus }: TaskListProps) {
  const router = useRouter()
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [completingAssignment, setCompletingAssignment] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")
  const [sortBy, setSortBy] = useState<SortType>("status")
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [showCompleted, setShowCompleted] = useState(false)
  const [batchLoading, setBatchLoading] = useState(false)

  const filteredTasks = useMemo(() => {
    let result = [...tasks]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (task) => task.title.toLowerCase().includes(query) || task.description?.toLowerCase().includes(query),
      )
    }

    // Apply my tasks filter
    if (filter === "my_tasks") {
      result = result.filter((task) => task.task_assignments.some((a) => a.user_id === currentUserId))
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === "status") {
        const statusOrder = { in_progress: 0, not_started: 1, assigned: 2, completed: 3 }
        const aStatus = a.task_assignments[0]?.status || a.status
        const bStatus = b.task_assignments[0]?.status || b.status
        return (
          (statusOrder[aStatus as keyof typeof statusOrder] || 3) -
          (statusOrder[bStatus as keyof typeof statusOrder] || 3)
        )
      }
      if (sortBy === "assignee") {
        const aName = a.task_assignments[0]?.profiles?.full_name || ""
        const bName = b.task_assignments[0]?.profiles?.full_name || ""
        return aName.localeCompare(bName)
      }
      if (sortBy === "hours") {
        return (b.estimated_hours || 0) - (a.estimated_hours || 0)
      }
      return 0
    })

    return result
  }, [tasks, searchQuery, filter, sortBy, currentUserId])

  const groupedTasks = useMemo(() => {
    const inProgress = filteredTasks.filter((t) => {
      const status = t.task_assignments[0]?.status || t.status
      return status === "in_progress"
    })
    const notStarted = filteredTasks.filter((t) => {
      const status = t.task_assignments[0]?.status || t.status
      return status === "not_started" || status === "assigned"
    })
    const completed = filteredTasks.filter((t) => {
      const status = t.task_assignments[0]?.status || t.status
      return status === "completed"
    })

    return { inProgress, notStarted, completed }
  }, [filteredTasks])

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    setUpdatingTaskId(taskId)
    const result = await updateTaskStatus(taskId, newStatus)
    setUpdatingTaskId(null)

    if (result.success && result.allTasksCompleted && !result.assignmentAlreadyCompleted) {
      setShowCompletionDialog(true)
    }

    router.refresh()
  }

  const handleCompleteAssignment = async () => {
    setCompletingAssignment(true)
    const result = await completeAssignment(assignmentId)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Assignment marked as completed!")
    }

    setCompletingAssignment(false)
    setShowCompletionDialog(false)
    router.refresh()
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return

    setDeletingTaskId(taskId)
    const result = await deleteTask(taskId)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Task deleted")
      router.refresh()
    }

    setDeletingTaskId(null)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const activeTasks = [...groupedTasks.inProgress, ...groupedTasks.notStarted]
      setSelectedTasks(new Set(activeTasks.map((t) => t.id)))
    } else {
      setSelectedTasks(new Set())
    }
  }

  const handleSelectTask = (taskId: string, checked: boolean) => {
    const newSelected = new Set(selectedTasks)
    if (checked) {
      newSelected.add(taskId)
    } else {
      newSelected.delete(taskId)
    }
    setSelectedTasks(newSelected)
  }

  const handleBatchComplete = async () => {
    if (selectedTasks.size === 0) return

    setBatchLoading(true)
    let successCount = 0

    for (const taskId of selectedTasks) {
      const result = await updateTaskStatus(taskId, "completed")
      if (result.success) successCount++
    }

    toast.success(`${successCount} tasks marked as completed`)
    setSelectedTasks(new Set())
    setBatchLoading(false)
    router.refresh()
  }

  const handleBatchDelete = async () => {
    if (selectedTasks.size === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedTasks.size} tasks?`)) return

    setBatchLoading(true)
    let successCount = 0

    for (const taskId of selectedTasks) {
      const result = await deleteTask(taskId)
      if (result.success) successCount++
    }

    toast.success(`${successCount} tasks deleted`)
    setSelectedTasks(new Set())
    setBatchLoading(false)
    router.refresh()
  }

  const statusColors = {
    not_started: "bg-gray-100 text-gray-800",
    assigned: "bg-gray-100 text-gray-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
  }

  const statusLabels = {
    not_started: "Not Started",
    assigned: "Assigned",
    in_progress: "In Progress",
    completed: "Completed",
  }

  const completedCount = tasks.filter(
    (t) => t.status === "completed" || t.task_assignments[0]?.status === "completed",
  ).length
  const totalCount = tasks.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const activeTasksCount = groupedTasks.inProgress.length + groupedTasks.notStarted.length

  const TaskCard = ({ task, showCheckbox = true }: { task: Task; showCheckbox?: boolean }) => {
    const assignment = task.task_assignments[0]
    const isAssignedToMe = assignment?.user_id === currentUserId
    const taskStatus = assignment?.status || task.status
    const isCompleted = taskStatus === "completed"
    const isSelected = selectedTasks.has(task.id)

    return (
      <Card
        className={`transition-all duration-200 ${
          isCompleted ? "opacity-60 bg-gray-50" : "hover:shadow-md"
        } ${isSelected ? "ring-2 ring-blue-500" : ""}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Drag handle and checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <GripVertical className="h-4 w-4 text-gray-300 cursor-grab" />
              {showCheckbox && !isCompleted && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => handleSelectTask(task.id, checked as boolean)}
                />
              )}
              {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            </div>

            {/* Task content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className={`font-medium ${isCompleted ? "line-through text-gray-500" : "text-gray-900"}`}>
                  {task.title}
                </h4>
                <Badge className={statusColors[taskStatus as keyof typeof statusColors]}>
                  {statusLabels[taskStatus as keyof typeof statusLabels]}
                </Badge>
              </div>

              {task.description && (
                <p className={`mt-1 text-sm line-clamp-2 ${isCompleted ? "text-gray-400" : "text-gray-600"}`}>
                  {task.description}
                </p>
              )}

              <div className="mt-2 flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                {task.estimated_hours && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {task.estimated_hours}h
                  </span>
                )}
                {assignment && (
                  <div className="flex items-center gap-1.5">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                        {assignment.profiles.full_name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate max-w-[120px]">{assignment.profiles.full_name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {isAssignedToMe && !isCompleted && (
                <>
                  {(taskStatus === "assigned" || taskStatus === "not_started") && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 bg-transparent"
                      onClick={() => handleStatusChange(task.id, "in_progress")}
                      disabled={updatingTaskId === task.id}
                    >
                      <Play className="h-3 w-3" />
                      Start
                    </Button>
                  )}
                  {taskStatus === "in_progress" && (
                    <Button
                      size="sm"
                      className="h-8 gap-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleStatusChange(task.id, "completed")}
                      disabled={updatingTaskId === task.id}
                    >
                      <Check className="h-3 w-3" />
                      Done
                    </Button>
                  )}
                </>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <EditTaskDialog task={task} members={members} />
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDelete(task.id)}
                    disabled={deletingTaskId === task.id}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const TaskGroup = ({
    title,
    tasks,
    icon,
    defaultOpen = true,
    showCheckboxes = true,
  }: {
    title: string
    tasks: Task[]
    icon: React.ReactNode
    defaultOpen?: boolean
    showCheckboxes?: boolean
  }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    if (tasks.length === 0) return null

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 text-left hover:bg-gray-50 rounded-lg px-2 transition-colors">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
          {icon}
          <span className="font-medium text-gray-700">{title}</span>
          <Badge variant="secondary" className="ml-auto">
            {tasks.length}
          </Badge>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} showCheckbox={showCheckboxes} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <>
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progress: {completedCount}/{totalCount} tasks completed
          </span>
          <span className="text-sm font-medium text-gray-700">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
            <SelectTrigger className="w-[140px]">
              <User className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="my_tasks">My Tasks</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortType)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="status">Sort by Status</SelectItem>
              <SelectItem value="assignee">Sort by Assignee</SelectItem>
              <SelectItem value="hours">Sort by Hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {activeTasksCount > 0 && (
        <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
          <Checkbox
            checked={selectedTasks.size === activeTasksCount && activeTasksCount > 0}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm text-gray-600">
            {selectedTasks.size > 0 ? `${selectedTasks.size} selected` : "Select all"}
          </span>

          {selectedTasks.size > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={handleBatchComplete}
                disabled={batchLoading}
                className="gap-1 bg-transparent"
              >
                <Check className="h-3.5 w-3.5" />
                Mark Complete
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleBatchDelete}
                disabled={batchLoading}
                className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <TaskGroup
          title="In Progress"
          tasks={groupedTasks.inProgress}
          icon={<div className="h-2 w-2 rounded-full bg-blue-500" />}
        />

        <TaskGroup
          title="Not Started"
          tasks={groupedTasks.notStarted}
          icon={<div className="h-2 w-2 rounded-full bg-gray-400" />}
        />

        {groupedTasks.completed.length > 0 && (
          <TaskGroup
            title="Completed"
            tasks={groupedTasks.completed}
            icon={<div className="h-2 w-2 rounded-full bg-green-500" />}
            defaultOpen={showCompleted}
            showCheckboxes={false}
          />
        )}
      </div>

      {/* Empty state */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {searchQuery || filter !== "all" ? (
            <p>No tasks match your filters</p>
          ) : (
            <p>No tasks yet. Add tasks to get started!</p>
          )}
        </div>
      )}

      {/* Completion dialog */}
      <AlertDialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <PartyPopper className="h-6 w-6 text-yellow-500" />
              All Tasks Completed!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Congratulations! You've completed all tasks for this assignment. Would you like to mark the entire
              assignment as completed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not Yet</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCompleteAssignment}
              disabled={completingAssignment}
              className="bg-green-600 hover:bg-green-700"
            >
              {completingAssignment ? "Completing..." : "Complete Assignment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
