"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useTaskStore } from "@/store/tasks";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { Skeleton } from "@/components/ui/Skeleton";
import { format, subDays } from "date-fns";

function buildChartData(tasks: ReturnType<typeof useTaskStore.getState>["tasks"]) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const key = format(date, "yyyy-MM-dd");
    const label = format(date, "EEE");
    return { key, label, created: 0, done: 0 };
  });

  tasks.forEach((task) => {
    const created = format(new Date(task.createdAt), "yyyy-MM-dd");
    const day = days.find((d) => d.key === created);
    if (day) {
      day.created += 1;
      if (task.status === "DONE") day.done += 1;
    }
  });

  return days;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-foreground font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export function TaskStatsChart() {
  const { isLoading } = useTasks();
  const tasks = useTaskStore((s) => s.tasks);
  const data = buildChartData(tasks);

  if (isLoading) return <Skeleton className="h-[180px] rounded-lg" />;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground mb-4">
        Task activity — last 7 days
      </p>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} barCategoryGap="30%">
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgb(var(--border))"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "rgb(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "rgb(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={24}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgb(var(--muted) / 0.5)" }}
          />
          <Bar
            dataKey="created"
            name="Created"
            fill="rgb(var(--foreground) / 0.15)"
            radius={[3, 3, 0, 0]}
          />
          <Bar
            dataKey="done"
            name="Done"
            fill="rgb(52 211 153)"
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}