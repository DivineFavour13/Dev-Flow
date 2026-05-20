import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TaskStatus } from "@prisma/client";

type UIStore = {
  theme: "dark" | "light";
  toggleTheme: () => void;

  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  commandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;

  taskModalOpen: boolean;
  editingTaskId: string | null;
  defaultStatus: TaskStatus;
  openTaskModal: (taskId?: string, defaultStatus?: TaskStatus) => void;
  closeTaskModal: () => void;
};

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: "dark",
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),

      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      commandPaletteOpen: false,
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),

      taskModalOpen: false,
      editingTaskId: null,
      defaultStatus: "TODO",
      openTaskModal: (taskId, defaultStatus) =>
        set({
          taskModalOpen: true,
          editingTaskId: taskId ?? null,
          defaultStatus: defaultStatus ?? "TODO",
        }),
      closeTaskModal: () =>
        set({ taskModalOpen: false, editingTaskId: null, defaultStatus: "TODO" }),
    }),
    {
      name: "devflow-ui",
      partialize: (s) => ({
        theme: s.theme,
        sidebarCollapsed: s.sidebarCollapsed,
      }),
    }
  )
);