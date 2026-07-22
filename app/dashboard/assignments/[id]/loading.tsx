import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AssignmentDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-4 w-32 rounded-md" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-10 rounded-md" />
        </div>
      </div>

      <Card className="mb-6 overflow-hidden">
        <Skeleton className="h-1.5 w-full rounded-none" />
        <CardContent className="pt-6">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start">
            <Skeleton className="h-8 w-2/3 rounded-md" />
            <Skeleton className="h-6 w-24 rounded-md" />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-4 w-40 rounded-md" />
            <Skeleton className="h-4 w-48 rounded-md" />
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <Skeleton className="mb-4 h-10 w-80 rounded-md" />
          <Skeleton className="h-40 w-full rounded-md" />
        </CardContent>
      </Card>
    </div>
  )
}
