"use client";

import { useState } from "react";
import { Search, CheckSquare, GitBranch, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRepos } from "@/features/dashboard/hooks/useGitHubActivity";
import { useTaskStore } from "@/store/tasks";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { useUIStore } from "@/store/ui";
import { useDebounce } from "@/hooks/useDebounce";
import { Badge } from "@/components/ui/Badge";
import {
  cn,
  formatDate,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  truncate,
  getLanguageColor,
} from "@/lib/utils";
import type { SearchResult } from "@/types";

export default function SearchPage() {
  useTasks();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 150);
  const [filter, setFilter] = useState<"all" | "task" | "repo">("all");

  const tasks = useTaskStore((s) => s.tasks);
  const { data: repos } = useRepos();
  const openTaskModal = useUIStore((s) => s.openTaskModal);

  const results: SearchResult[] = debouncedQuery.trim()
    ? [
        ...tasks
          .filter(
            (t) =>
              t.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
              (t.description ?? "")
                .toLowerCase()
                .includes(debouncedQuery.toLowerCase())
          )
          .map((t): SearchResult => ({ type: "task", item: t })),
        ...(repos ?? [])
          .filter(
            (r) =>
              r.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
              (r.description ?? "")
                .toLowerCase()
                .includes(debouncedQuery.toLowerCase())
          )
          .map((r): SearchResult => ({ type: "repo", item: r })),
      ]
    : [];

  const filtered =
    filter === "all" ? results : results.filter((r) => r.type === filter);

  const taskCount = results.filter((r) => r.type === "task").length;
  const repoCount = results.filter((r) => r.type === "repo").length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Search</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search across tasks and repositories
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          autoFocus
          type="text"
          placeholder="Search tasks, repos, descriptions…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-11 pl-11 pr-4 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-foreground/20 transition-colors"
        />
      </div>

      {results.length > 0 && (
        <div className="flex gap-1 p-1 rounded-lg bg-muted w-fit">
          {(
            [
              { key: "all", label: `All (${results.length})` },
              { key: "task", label: `Tasks (${taskCount})` },
              { key: "repo", label: `Repos (${repoCount})` },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                filter === key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {filtered.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            {filtered.map((result, i) => (
              <motion.div
                key={result.type === "task" ? result.item.id : result.item.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                {result.type === "task" ? (
                  <button
                    onClick={() => openTaskModal(result.item.id)}
                    className="w-full flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:border-foreground/20 hover:bg-muted/40 transition-colors text-left"
                  >
                    <CheckSquare className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {result.item.title}
                      </p>
                      {result.item.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {result.item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant={
                            result.item.status === "DONE"
                              ? "success"
                              : result.item.status === "IN_PROGRESS"
                              ? "info"
                              : "default"
                          }
                        >
                          {STATUS_LABELS[result.item.status]}
                        </Badge>
                        <span
                          className={cn(
                            "text-xs font-medium",
                            PRIORITY_COLORS[result.item.priority]
                          )}
                        >
                          {PRIORITY_LABELS[result.item.priority]}
                        </span>
                        {result.item.dueDate && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {formatDate(result.item.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ) : (
                  <a
                    href={result.item.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:border-foreground/20 hover:bg-muted/40 transition-colors"
                  >
                    <GitBranch className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {result.item.name}
                      </p>
                      {result.item.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {truncate(result.item.description, 100)}
                        </p>
                      )}
                      {result.item.language && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: getLanguageColor(
                                result.item.language
                              ),
                            }}
                          />
                          {result.item.language}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      Repo
                    </span>
                  </a>
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : debouncedQuery ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-16 text-muted-foreground"
          >
            <Search className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm">No results for &ldquo;{debouncedQuery}&rdquo;</p>
            <p className="text-xs mt-1 opacity-60">
              Try a different keyword or check your spelling
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-16 text-muted-foreground"
          >
            <Search className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm">Start typing to search</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}