"use client";

import { Star, GitFork, ExternalLink } from "lucide-react";
import { useRepos } from "@/features/dashboard/hooks/useGitHubActivity";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn, formatNumber, getLanguageColor, formatRelativeDate } from "@/lib/utils";

export function RepoGrid() {
  const { data: repos, isLoading, error } = useRepos();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error || !repos?.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">No repositories found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {repos.slice(0, 9).map((repo) => (
        <a
          key={repo.id}
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "group flex flex-col p-4 rounded-lg border border-border bg-card",
            "hover:border-foreground/20 transition-colors"
          )}
        >
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm font-medium text-foreground truncate">
              {repo.name}
            </p>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {repo.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
              {repo.description}
            </p>
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
            <span className="ml-auto">{formatRelativeDate(repo.updated_at)}</span>
          </div>
        </a>
      ))}
    </div>
  );
}