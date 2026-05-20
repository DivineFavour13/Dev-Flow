"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState, useRef, useMemo } from "react";
import { useTaskStore } from "@/store/tasks";
import { useTasks, useUpdateTask } from "@/features/tasks/hooks/useTasks";
import { needsRebalance } from "@/lib/position";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import type { TaskWithLabels } from "@/types";
import type { TaskStatus } from "@prisma/client";

const COLUMN_CONFIG = [
  { id: "TODO" as const, title: "To Do" },
  { id: "IN_PROGRESS" as const, title: "In Progress" },
  { id: "DONE" as const, title: "Done" },
];

export function KanbanBoard() {
  useTasks();
  const tasks = useTaskStore((s) => s.tasks);
  const moveTask = useTaskStore((s) => s.moveTask);
  const revertMove = useTaskStore((s) => s.revertMove);
  const updateTask = useUpdateTask();

  const columns = useMemo(() =>
    COLUMN_CONFIG.map((col) => ({
      ...col,
      tasks: tasks
        .filter((t) => t.status === col.id)
        .sort((a, b) => a.position - b.position),
    })), [tasks]);

  const [activeTask, setActiveTask] = useState<TaskWithLabels | null>(null);
  const moveCountRef = useRef(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function onDragStart(event: DragStartEvent) {
    const task = columns
      .flatMap((c) => c.tasks)
      .find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || active.id === over.id) return;

    const allTasks = columns.flatMap((c) => c.tasks);
    const draggedTask = allTasks.find((t) => t.id === active.id);
    if (!draggedTask) return;

    let toColumn: TaskStatus;
    let prevTask: TaskWithLabels | null = null;
    let nextTask: TaskWithLabels | null = null;

    const overIsColumn = columns.some((c) => c.id === over.id);

    if (overIsColumn) {
      toColumn = over.id as TaskStatus;
      const colTasks = columns.find((c) => c.id === toColumn)?.tasks ?? [];
      prevTask = colTasks[colTasks.length - 1] ?? null;
    } else {
      const overTask = allTasks.find((t) => t.id === over.id);
      if (!overTask) return;
      toColumn = overTask.status;

      const colTasks = columns.find((c) => c.id === toColumn)?.tasks ?? [];
      const overIdx = colTasks.findIndex((t) => t.id === over.id);
      prevTask = colTasks[overIdx - 1] ?? null;
      nextTask = colTasks[overIdx] ?? null;
    }

    const originalStatus = draggedTask.status;
    const originalPosition = draggedTask.position;

    const { newPosition } = moveTask({
      taskId: draggedTask.id,
      fromColumn: originalStatus,
      toColumn,
      prevTask,
      nextTask,
    });

    moveCountRef.current += 1;

    updateTask.mutate(
      { id: draggedTask.id, status: toColumn, position: newPosition },
      {
        onError: () => {
          revertMove(draggedTask.id, originalStatus, originalPosition);
        },
      }
    );

    const colTasks = columns.find((c) => c.id === toColumn)?.tasks ?? [];
    if (needsRebalance(colTasks, moveCountRef.current)) {
      console.debug("[kanban] rebalance triggered");
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {columns.map((col) => (
          <SortableContext
            key={col.id}
            items={col.tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <KanbanColumn column={col} />
          </SortableContext>
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}