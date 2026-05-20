"use client";

import { useGitHubActivity } from "@/features/dashboard/hooks/useGitHubActivity";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

const LEVEL_COLORS = [
  "bg-muted",
  "bg-emerald-900",
  "bg-emerald-700",
  "bg-emerald-500",
  "bg-emerald-400",
] as const;

export function ActivityGraph() {
  const { data, isLoading, error } = useGitHubActivity();

  if (isLoading) {
    return <Skeleton className="h-[120px] w-full rounded-lg" />;
  }

  if (error || !data) {
    return (
      <div className="h-[120px] flex items-center justify-center rounded-lg border border-border bg-card">
        <p className="text-xs text-muted-foreground">
          Could not load activity
        </p>
      </div>
    );
  }

  const weeks: (typeof data)[] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  const totalContributions = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground">
          <span className="text-foreground font-medium">
            {totalContributions.toLocaleString()}
          </span>{" "}
          contributions in the last year
        </p>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          Less
          {LEVEL_COLORS.map((color, i) => (
            <div key={i} className={cn("w-2.5 h-2.5 rounded-[2px]", color)} />
          ))}
          More
        </div>
      </div>

      <div className="flex gap-0.5 overflow-hidden">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} contributions`}
                className={cn(
                  "w-2.5 h-2.5 rounded-[2px] transition-opacity hover:opacity-75",
                  LEVEL_COLORS[day.level]
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}