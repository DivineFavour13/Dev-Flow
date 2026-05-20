"use client";

import { Star, GitFork, CircleDot, ExternalLink, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn, formatNumber, getLanguageColor, formatRelativeDate } from "@/lib/utils";
import type { GitHubRepo } from "@/types";

type Props = {
  repo: GitHubRepo;
  selected?: boolean;
  onClick: () => void;
};

export function RepoCard({ repo, selected, onClick }: Props) {
  return (
    <motion.div
      layout
      onClick={onClick}
      className={cn(
        "group flex flex-col gap-3 p-4 rounded-xl border cursor-pointer",
        "transition-all duration-150",
        selected
          ? "border-foreground/30 bg-foreground/5 shadow-sm"
          : "border-border bg-card hover:border-foreground/20 hover:bg-muted/40"
      )}
    >
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {repo.name}
            </p>
            {repo.private && (
              <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded border border-border text-muted-foreground">
                Private
              </span>
            )}
          </div>
          {repo.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {repo.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          
            <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <ChevronRight
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform",
              selected && "rotate-90"
            )}
          />
        </div>
      </div>

      {repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {repo.topics.slice(0, 4).map((topic) => (
            <span
              key={topic}
              className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-medium"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto">
        {repo.language && (
          <span className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getLanguageColor(repo.language) }}
            />
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Star className="w-3 h-3" />
          {formatNumber(repo.stargazers_count)}
        </span>
        <span className="flex items-center gap-1">
          <GitFork className="w-3 h-3" />
          {formatNumber(repo.forks_count)}
        </span>
        {repo.open_issues_count > 0 && (
          <span className="flex items-center gap-1">
            <CircleDot className="w-3 h-3" />
            {repo.open_issues_count}
          </span>
        )}
        <span className="ml-auto">{formatRelativeDate(repo.updated_at)}</span>
      </div>
    </motion.div>
  );
}