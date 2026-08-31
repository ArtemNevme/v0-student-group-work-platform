import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function CalendarLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-32 rounded-md" />
        <Skeleton className="h-4 w-64 rounded-md" />
      </div>

      <Card>
        <CardContent className="p-4">
          <Skeleton className="mb-4 h-8 w-full rounded-md" />
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-control" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
