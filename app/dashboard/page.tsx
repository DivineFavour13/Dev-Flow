import type { Metadata } from "next";
import { ActivityGraph } from "@/components/charts/ActivityGraph";
import { TaskStatsChart } from "@/components/charts/TaskStatsChart";
import { RepoGrid } from "@/features/dashboard/components/RepoGrid";
import { CommitFeed } from "@/features/dashboard/components/CommitFeed";
import { TaskSummary } from "@/features/dashboard/components/TaskSummary";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your activity and projects at a glance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TaskSummary />
        <div className="lg:col-span-2">
          <ActivityGraph />
        </div>
      </div>

      <TaskStatsChart />

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
          Recent Repositories
        </h2>
        <RepoGrid />
      </section>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
          Recent Commits
        </h2>
        <CommitFeed />
      </section>
    </div>
  );
}