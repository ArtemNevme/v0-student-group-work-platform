import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function MyTasksLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="h-4 w-48 rounded-md" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-32 rounded-md" />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="mb-2 h-5 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
