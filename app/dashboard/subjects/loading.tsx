import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function SubjectsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40 rounded-md" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="mb-4 h-6 w-3/4 rounded-md" />
              <Skeleton className="mb-2 h-4 w-1/2 rounded-md" />
              <Skeleton className="h-4 w-1/3 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
