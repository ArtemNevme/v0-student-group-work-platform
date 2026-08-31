import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function GroupDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <Skeleton className="mb-4 h-4 w-24 rounded-md" />

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-md" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>

      <Skeleton className="mb-6 h-10 w-80 rounded-md" />

      <Card>
        <CardContent className="p-4 sm:p-6">
          <Skeleton className="mb-4 h-6 w-32 rounded-md" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-control" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
