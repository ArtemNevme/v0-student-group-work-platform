"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TaskList } from "@/components/assignments/task-list"
import { CreateTaskDialog } from "@/components/assignments/create-task-dialog"
import { AIWorkPlanner } from "@/components/assignments/ai-work-planner"
import { AITaskAssistant } from "@/components/assignments/ai-task-assistant"
import { SourceRecommendations } from "@/components/assignments/source-recommendations"
import { SourcesList } from "@/components/assignments/sources-list"
import { FileUpload } from "@/components/assignments/file-upload"
import { ProgressRing } from "@/components/assignments/overview/progress-ring"
import { TimeRemaining } from "@/components/assignments/overview/time-remaining"
import { TeamWorkload } from "@/components/assignments/overview/team-workload"
import { ActivityTimeline } from "@/components/assignments/overview/activity-timeline"
import { PriorityBadge } from "@/components/assignments/overview/priority-badge"
import {
  FileText,
  ListTodo,
  Paperclip,
  Link2,
  Sparkles,
  Plus,
  BookOpen,
  Users,
  Activity,
  ExternalLink,
} from "lucide-react"

interface AssignmentTabsProps {
  assignment: any
  tasks: any[]
  files: any[]
  links: any[]
  members: any[]
  currentUserId: string
}

function linkifyText(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline break-all"
        >
          {part}
          <ExternalLink className="h-3 w-3 flex-shrink-0" />
        </a>
      )
    }
    return <span key={index}>{part}</span>
  })
}

export function AssignmentTabs({ assignment, tasks, files, links, members, currentUserId }: AssignmentTabsProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const hasTasks = tasks.length > 0

  // Calculate progress
  const completedTasks = tasks.filter((t) => t.status === "completed").length
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
        <TabsTrigger value="overview" className="gap-2">
          <FileText className="h-4 w-4 hidden sm:block" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="tasks" className="gap-2">
          <ListTodo className="h-4 w-4 hidden sm:block" />
          Tasks
          {tasks.length > 0 && (
            <span className="ml-1 rounded-full bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
              {tasks.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="files" className="gap-2">
          <Paperclip className="h-4 w-4 hidden sm:block" />
          Files
          {files.length > 0 && (
            <span className="ml-1 rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs font-medium">
              {files.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="sources" className="gap-2">
          <Link2 className="h-4 w-4 hidden sm:block" />
          Sources
          {links.length > 0 && (
            <span className="ml-1 rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs font-medium">
              {links.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      {/* Overview Tab - REDESIGNED */}
      <TabsContent value="overview" className="space-y-6">
        {/* Row 1: Progress, Time, Priority */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Progress Ring */}
          <Card>
            <CardContent className="pt-6 flex justify-center">
              <ProgressRing progress={progress} completedTasks={completedTasks} totalTasks={tasks.length} />
            </CardContent>
          </Card>

          {/* Time Remaining */}
          <Card>
            <CardContent className="pt-6">
              <TimeRemaining
                deadline={assignment.deadline}
                status={assignment.status}
                createdAt={assignment.created_at}
              />
            </CardContent>
          </Card>

          {/* Priority & Quick Stats */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Priority</p>
                <PriorityBadge priority={assignment.priority || "medium"} size="lg" />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{files.length}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Files</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{links.length}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sources</p>
                </div>
              </div>

              {assignment.estimated_hours && (
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                  <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                    ~{assignment.estimated_hours}h
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Estimated</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Row 2: Description */}
        {assignment.description && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-gray-500" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 break-words leading-relaxed">
                  {linkifyText(assignment.description)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Row 3: Team Workload & Activity */}
        {hasTasks && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Team Workload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  Team Workload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TeamWorkload tasks={tasks} members={members} />
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-gray-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityTimeline tasks={tasks} files={files} links={links} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Get Started - if no tasks */}
        {!hasTasks && (
          <Card className="border-dashed">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Get Started
              </CardTitle>
              <CardDescription>Choose how you want to plan your work</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="border-2 hover:border-blue-500 transition-colors cursor-pointer group">
                  <CardContent className="pt-6 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold mb-2">AI Work Planner</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Let AI analyze your assignment and create a detailed work plan
                    </p>
                    <Button variant="outline" className="w-full bg-transparent" onClick={() => setActiveTab("tasks")}>
                      Use AI Planner
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-green-500 transition-colors cursor-pointer group">
                  <CardContent className="pt-6 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Plus className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold mb-2">Manual Planning</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Create your own tasks and organize work your way
                    </p>
                    <CreateTaskDialog assignmentId={assignment.id} members={members}>
                      <Button variant="outline" className="w-full bg-transparent">
                        Create Tasks
                      </Button>
                    </CreateTaskDialog>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Tasks Tab */}
      <TabsContent value="tasks" className="space-y-6">
        {hasTasks ? (
          <>
            {/* Task Actions Bar */}
            <Card>
              <CardContent className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <CreateTaskDialog assignmentId={assignment.id} members={members} />
                    <AITaskAssistant assignmentId={assignment.id} members={members} />
                  </div>
                  <SourceRecommendations assignmentId={assignment.id} />
                </div>
              </CardContent>
            </Card>

            {/* Tasks List */}
            <Card>
              <CardHeader>
                <CardTitle>Tasks ({tasks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskList
                  tasks={tasks}
                  currentUserId={currentUserId}
                  members={members}
                  assignmentId={assignment.id}
                  assignmentStatus={assignment.status}
                />
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="space-y-6">
            {/* AI Work Planner */}
            <AIWorkPlanner assignmentId={assignment.id} files={files} />

            {/* Manual Option */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Or Create Tasks Manually
                </CardTitle>
                <CardDescription>Prefer to plan your own way? Add tasks one by one.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <CreateTaskDialog assignmentId={assignment.id} members={members} />
                  <SourceRecommendations assignmentId={assignment.id} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </TabsContent>

      {/* Files Tab */}
      <TabsContent value="files">
        <FileUpload assignmentId={assignment.id} files={files} />
      </TabsContent>

      {/* Sources Tab */}
      <TabsContent value="sources">
        <div className="space-y-6">
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add helpful resources and references for your assignment
                </p>
                <SourceRecommendations assignmentId={assignment.id} />
              </div>
            </CardContent>
          </Card>
          <SourcesList assignmentId={assignment.id} sources={links} />
        </div>
      </TabsContent>
    </Tabs>
  )
}
