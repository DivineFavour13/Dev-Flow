"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskCard } from "./TaskCard";
import { useUIStore } from "@/store/ui";
import type { KanbanColumn as KanbanColumnType } from "@/types";
import type { TaskStatus } from "@prisma/client";

const COLUMN_STYLES = {
  TODO: "border-border",
  IN_PROGRESS: "border-blue-500/50",
  DONE: "border-emerald-500/50",
} as const;

const COUNT_STYLES = {
  TODO: "text-muted-foreground",
  IN_PROGRESS: "text-blue-400",
  DONE: "text-emerald-400",
} as const;

export function KanbanColumn({ column }: { column: KanbanColumnType }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const openTaskModal = useUIStore((s) => s.openTaskModal);

  return (
    <div className="flex flex-col w-72 shrink-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-foreground">{column.title}</h3>
          <span className={cn("text-xs font-mono", COUNT_STYLES[column.id])}>
            {column.tasks.length}
          </span>
        </div>
        <button
          onClick={() => openTaskModal(undefined, column.id as TaskStatus)}
          className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Add task"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 flex flex-col gap-2 rounded-lg p-2 min-h-[120px]",
          "border transition-colors",
          COLUMN_STYLES[column.id],
          isOver ? "bg-muted/50" : "bg-card/40"
        )}
      >
        <SortableContext
          items={column.tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {column.tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-muted-foreground/50">Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
}