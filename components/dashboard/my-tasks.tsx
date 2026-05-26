import Link from "next/link"
import { CheckSquare, Circle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Task {
  id: string
  status: string
  tasks: {
    id: string
    title: string
    description: string
    estimated_hours: number
    assignments: {
      id: string
      title: string
      deadline: string
      groups: {
        id: string
        name: string
      }
    }
  }
}

interface MyTasksProps {
  tasks: Task[]
}

export function MyTasks({ tasks }: MyTasksProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "not_started":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "in_progress":
        return "In Progress"
      case "not_started":
        return "Not Started"
      default:
        return status
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          My Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Circle className="mb-2 h-12 w-12 text-gray-400" />
            <p className="text-sm text-gray-600">No pending tasks</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((taskAssignment) => (
              <Link
                key={taskAssignment.id}
                href={`/dashboard/assignments/${taskAssignment.tasks.assignments.id}`}
                className="block rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{taskAssignment.tasks.title}</h4>
                    <p className="mt-1 text-sm text-gray-600">{taskAssignment.tasks.assignments.groups.name}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {taskAssignment.tasks.assignments.title} • {taskAssignment.tasks.estimated_hours}h
                    </p>
                  </div>
                  <Badge className={getStatusColor(taskAssignment.status)}>
                    {getStatusLabel(taskAssignment.status)}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
