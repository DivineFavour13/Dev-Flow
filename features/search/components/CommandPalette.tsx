"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, CheckSquare, GitBranch, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/ui";
import { useTaskStore } from "@/store/tasks";
import { useRepos } from "@/features/dashboard/hooks/useGitHubActivity";
import { cn, truncate } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import type { SearchResult } from "@/types";

export function CommandPalette() {
  const { commandPaletteOpen, closeCommandPalette } = useUIStore();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 150);
  const router = useRouter();

  const tasks = useTaskStore((s) => s.tasks);
  const { data: repos } = useRepos();

  const closePalette = useCallback(() => {
    setQuery("");
    closeCommandPalette();
  }, [closeCommandPalette]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        useUIStore.getState().openCommandPalette();
      }
      if (e.key === "Escape") closePalette();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closePalette]);

  const results: SearchResult[] = debouncedQuery.trim()
    ? [
        ...tasks
          .filter((t) =>
            t.title.toLowerCase().includes(debouncedQuery.toLowerCase())
          )
          .slice(0, 5)
          .map((t): SearchResult => ({ type: "task", item: t })),
        ...(repos ?? [])
          .filter((r) =>
            r.name.toLowerCase().includes(debouncedQuery.toLowerCase())
          )
          .slice(0, 5)
          .map((r): SearchResult => ({ type: "repo", item: r })),
      ]
    : [];

  const handleSelect = useCallback(
    (result: SearchResult) => {
      if (result.type === "task") {
        useUIStore.getState().openTaskModal(result.item.id);
      } else {
        router.push("/repos");
      }
      closePalette();
    },
    [router, closePalette]
  );

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closePalette}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[20vh] left-1/2 -translate-x-1/2 w-full max-w-lg z-50"
          >
            <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 border-b border-border">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search tasks, repos…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 h-12 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                <button
                  onClick={closePalette}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {results.length > 0 ? (
                <ul className="py-2 max-h-80 overflow-y-auto">
                  {results.map((result, i) => (
                    <li key={i}>
                      <button
                        onClick={() => handleSelect(result)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-left",
                          "hover:bg-muted transition-colors"
                        )}
                      >
                        {result.type === "task" ? (
                          <CheckSquare className="w-4 h-4 text-muted-foreground shrink-0" />
                        ) : (
                          <GitBranch className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {result.type === "task"
                              ? result.item.title
                              : result.item.name}
                          </p>
                          {result.type === "repo" && result.item.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {truncate(result.item.description, 60)}
                            </p>
                          )}
                        </div>
                        <span className="ml-auto text-xs text-muted-foreground capitalize shrink-0">
                          {result.type}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : debouncedQuery ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No results for &ldquo;{debouncedQuery}&rdquo;
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Start typing to search
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
