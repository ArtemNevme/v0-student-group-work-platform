import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProfileLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <Card className="mb-6 overflow-hidden">
        <Skeleton className="h-32 w-full rounded-none" />
        <CardContent className="relative px-6 pb-6">
          <Skeleton className="absolute -top-14 left-6 h-28 w-28 rounded-full" />
          <div className="flex justify-end pt-2">
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-8 w-48 rounded-md" />
            <Skeleton className="h-4 w-full max-w-md rounded-md" />
            <div className="mt-4 flex flex-wrap gap-4">
              <Skeleton className="h-5 w-32 rounded-md" />
              <Skeleton className="h-5 w-32 rounded-md" />
              <Skeleton className="h-5 w-32 rounded-md" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <Skeleton className="mb-3 h-6 w-24 rounded-md" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="mb-2 h-4 w-24 rounded-md" />
                <Skeleton className="h-8 w-16 rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <Skeleton className="mb-4 h-6 w-32 rounded-md" />
          <Skeleton className="h-40 w-full rounded-md" />
        </CardContent>
      </Card>

      <Skeleton className="h-6 w-32 rounded-md" />
    </div>
  )
}
