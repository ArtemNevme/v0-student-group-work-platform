import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function GoogleClassroomLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-64 rounded-md" />
        <Skeleton className="h-4 w-80 rounded-md" />
      </div>

      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <Skeleton className="mb-4 h-6 w-48 rounded-md" />
          <Skeleton className="mb-2 h-4 w-full rounded-md" />
          <Skeleton className="mb-4 h-4 w-3/4 rounded-md" />
          <Skeleton className="h-10 w-48 rounded-md" />
        </CardContent>
      </Card>
    </div>
  )
}
