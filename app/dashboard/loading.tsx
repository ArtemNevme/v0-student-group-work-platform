import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6">
      {/* Welcome header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-md" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-chip" />
          <Skeleton className="h-8 w-24 rounded-chip" />
        </div>
      </div>

      {/* Stats */}
      <section className="mb-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 sm:p-5">
                <Skeleton className="mb-2 h-4 w-24 rounded-md" />
                <Skeleton className="h-8 w-16 rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Google Classroom banner */}
      <Skeleton className="mb-6 h-14 w-full rounded-card" />

      {/* Main grid */}
      <div className="mb-6 grid items-start gap-3 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <Card>
            <CardContent className="p-4 sm:p-5">
              <Skeleton className="mb-4 h-5 w-32 rounded-md" />
              <div className="flex flex-col gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-control" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-5">
              <Skeleton className="mb-4 h-5 w-36 rounded-md" />
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-control" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-3">
          <Card>
            <CardContent className="p-4 sm:p-5">
              <Skeleton className="mb-4 h-5 w-24 rounded-md" />
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-control" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-5">
              <Skeleton className="mb-4 h-5 w-28 rounded-md" />
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-control" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-5">
              <Skeleton className="mb-4 h-5 w-32 rounded-md" />
              <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-control" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Subjects section */}
      <section className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-6 w-32 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-card" />
          ))}
        </div>
      </section>
    </div>
  )
}
