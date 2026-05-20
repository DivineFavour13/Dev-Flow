import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools } from "zustand/middleware";
import type { TaskWithLabels, KanbanColumn } from "@/types";
import { TaskStatus } from "@prisma/client";
import { calculatePosition } from "@/lib/position";

const COLUMN_CONFIG: { id: TaskStatus; title: string }[] = [
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "DONE", title: "Done" },
];

type MovePayload = {
  taskId: string;
  fromColumn: TaskStatus;
  toColumn: TaskStatus;
  prevTask: TaskWithLabels | null;
  nextTask: TaskWithLabels | null;
};

type TaskStore = {
  tasks: TaskWithLabels[];
  isLoading: boolean;
  moveCount: number;

  columns: () => KanbanColumn[];

  setTasks: (tasks: TaskWithLabels[]) => void;
  setLoading: (loading: boolean) => void;

  addTask: (task: TaskWithLabels) => void;
  updateTask: (id: string, patch: Partial<TaskWithLabels>) => void;
  removeTask: (id: string) => void;

  moveTask: (payload: MovePayload) => { newPosition: number };
  confirmMove: (id: string, position: number) => void;
  revertMove: (id: string, originalStatus: TaskStatus, originalPosition: number) => void;
};

export const useTaskStore = create<TaskStore>()(
  devtools(
    immer((set, get) => ({
      tasks: [],
      isLoading: false,
      moveCount: 0,

      columns: () => {
        const { tasks } = get();
        return COLUMN_CONFIG.map((col) => ({
          ...col,
          tasks: tasks
            .filter((t) => t.status === col.id)
            .sort((a, b) => a.position - b.position),
        }));
      },

      setTasks: (tasks) =>
        set((state) => {
          state.tasks = tasks;
        }),

      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading;
        }),

      addTask: (task) =>
        set((state) => {
          state.tasks.push(task);
        }),

      updateTask: (id, patch) =>
        set((state) => {
          const idx = state.tasks.findIndex((t) => t.id === id);
          if (idx !== -1) Object.assign(state.tasks[idx], patch);
        }),

      removeTask: (id) =>
        set((state) => {
          state.tasks = state.tasks.filter((t) => t.id !== id);
        }),

      moveTask: ({ taskId, toColumn, prevTask, nextTask }) => {
        const newPosition = calculatePosition(prevTask, nextTask);

        set((state) => {
          const idx = state.tasks.findIndex((t) => t.id === taskId);
          if (idx !== -1) {
            state.tasks[idx].status = toColumn;
            state.tasks[idx].position = newPosition;
          }
          state.moveCount += 1;
        });

        return { newPosition };
      },

      confirmMove: (id, position) =>
        set((state) => {
          const idx = state.tasks.findIndex((t) => t.id === id);
          if (idx !== -1) state.tasks[idx].position = position;
        }),


      revertMove: (id, originalStatus, originalPosition) =>
        set((state) => {
          const idx = state.tasks.findIndex((t) => t.id === id);
          if (idx !== -1) {
            state.tasks[idx].status = originalStatus;
            state.tasks[idx].position = originalPosition;
          }
        }),
    })),
    { name: "task-store" }
  )
);