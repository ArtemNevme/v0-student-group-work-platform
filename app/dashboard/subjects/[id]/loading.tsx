import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function SubjectDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <Skeleton className="mb-4 h-4 w-32 rounded-md" />

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-control" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-md" />
            <Skeleton className="h-4 w-64 rounded-md" />
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-3 p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-6 w-12 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <Skeleton className="mb-4 h-10 w-80 rounded-md" />
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
