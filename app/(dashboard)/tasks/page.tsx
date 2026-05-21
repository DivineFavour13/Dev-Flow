import type { Metadata } from "next";
import { KanbanBoard } from "@/features/tasks/components/KanbanBoard";

export const metadata: Metadata = { title: "Tasks" };

export default function TasksPage() {
  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Drag to reorder, click to edit
          </p>
        </div>
      </div>
      <KanbanBoard />
    </div>
  );
}