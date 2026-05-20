"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { Calendar, GripVertical } from "lucide-react";
import { cn, formatDate, PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/utils";
import { useUIStore } from "@/store/ui";
import type { TaskWithLabels } from "@/types";

type Props = {
  task: TaskWithLabels;
  isDragging?: boolean;
};

export function TaskCard({ task, isDragging = false }: Props) {
  const openTaskModal = useUIStore((s) => s.openTaskModal);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "group relative bg-card border border-border rounded-lg p-3",
        "cursor-pointer select-none",
        "hover:border-foreground/20 transition-colors",
        (isDragging || isSortableDragging) && "opacity-40 shadow-lg scale-[1.02]"
      )}
      onClick={() => openTaskModal(task.id)}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute left-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
      </div>

      <div className="pl-3">
        <p className="text-sm font-medium text-foreground leading-snug mb-2">
          {task.title}
        </p>

        {task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.labels.map(({ label }) => (
              <span
                key={label.id}
                className="inline-flex items-center h-4 px-1.5 rounded text-[10px] font-medium"
                style={{
                  backgroundColor: `${label.color}22`,
                  color: label.color,
                }}
              >
                {label.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span
            className={cn(
              "text-[10px] font-medium uppercase tracking-wide",
              PRIORITY_COLORS[task.priority]
            )}
          >
            {PRIORITY_LABELS[task.priority]}
          </span>

          {task.dueDate && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Calendar className="w-2.5 h-2.5" />
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}