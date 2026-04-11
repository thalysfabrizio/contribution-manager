import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export function DashboardSkeleton() {
  return (
    <div className="min-h-[calc(100dvh-3.5rem)] p-4 md:p-6 lg:p-8">
      <div className="max-w-[1200px] mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-11 w-40 rounded-lg" />
        </div>

        {/* Summary Cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} className="p-4 md:p-5" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="size-9 rounded-full" />
              </div>
              <Skeleton className="h-7 w-24 mb-2" />
              <Skeleton className="h-3 w-20" />
            </Card>
          ))}
        </div>

        {/* Legend skeleton */}
        <Skeleton className="h-10 w-56 rounded-lg" />

        {/* Table skeleton */}
        <Card>
          <div className="p-4 space-y-3">
            <Skeleton className="h-10 w-full" />
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
