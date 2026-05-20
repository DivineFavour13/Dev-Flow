"use client";

import { useTaskStore } from "@/store/tasks";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = [
  { key: "TODO" as const, label: "To Do", color: "text-muted-foreground" },
  { key: "IN_PROGRESS" as const, label: "In Progress", color: "text-blue-400" },
  { key: "DONE" as const, label: "Done", color: "text-emerald-400" },
];

export function TaskSummary() {
  const { isLoading } = useTasks();
  const tasks = useTaskStore((s) => s.tasks);

  if (isLoading) {
    return <Skeleton className="h-[120px] w-full rounded-lg" />;
  }

  const counts = {
    TODO: tasks.filter((t) => t.status === "TODO").length,
    IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    DONE: tasks.filter((t) => t.status === "DONE").length,
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground mb-4">Task overview</p>
      <div className="space-y-3">
        {STATUS_CONFIG.map(({ key, label, color }) => {
          const count = counts[key];
          const total = tasks.length || 1;
          const pct = Math.round((count / total) * 100);

          return (
            <div key={key}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={cn("font-medium", color)}>{label}</span>
                <span className="text-muted-foreground">{count}</span>
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    key === "TODO" && "bg-muted-foreground/40",
                    key === "IN_PROGRESS" && "bg-blue-500",
                    key === "DONE" && "bg-emerald-500"
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}