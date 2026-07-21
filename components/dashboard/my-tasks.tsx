import Link from "next/link"
import { CheckSquare, Circle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
  const getStatusClass = (status: string) => {
    switch (status) {
      case "in_progress":
        return "bg-accent-soft text-accent-fg"
      default:
        return "bg-secondary text-muted-foreground"
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
        <CardTitle className="flex items-center gap-2 font-display text-[15px] font-medium tracking-[-0.01em]">
          <CheckSquare className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          My Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Circle className="mb-2 h-10 w-10 text-muted-foreground" strokeWidth={1.75} />
            <p className="text-sm text-muted-foreground">No pending tasks</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((taskAssignment) => (
              <Link
                key={taskAssignment.id}
                href={`/dashboard/assignments/${taskAssignment.tasks.assignments.id}`}
                className="block rounded-control border border-border p-3.5 transition-colors duration-150 hover:bg-secondary"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">{taskAssignment.tasks.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {taskAssignment.tasks.assignments.groups.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {taskAssignment.tasks.assignments.title} ·{" "}
                      <span className="font-num">{taskAssignment.tasks.estimated_hours} h</span>
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-chip px-2 py-0.5 text-[11px] font-medium ${getStatusClass(taskAssignment.status)}`}
                  >
                    {getStatusLabel(taskAssignment.status)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
