import { Skeleton } from "@/components/ui/Skeleton";

export default function TasksLoading() {
  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="space-y-1">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-44" />
      </div>

      <div className="flex gap-4">
        {Array.from({ length: 3 }).map((_, col) => (
          <div key={col} className="w-72 shrink-0 space-y-2">
            <div className="flex items-center justify-between mb-3 px-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-6 rounded" />
            </div>
            {Array.from({ length: col === 1 ? 4 : 2 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}