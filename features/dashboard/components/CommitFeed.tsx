"use client";

import { GitCommit } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatRelativeDate, truncate } from "@/lib/utils";
import type { GitHubCommit } from "@/types";

function useRecentCommits() {
  return useQuery<GitHubCommit[]>({
    queryKey: ["github", "commits"],
    queryFn: async () => [],
    staleTime: 7 * 60 * 1000,
  });
}

export function CommitFeed() {
  const { data: commits, isLoading } = useRecentCommits();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!commits?.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Select a repository on the Repos page to see recent commits
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card divide-y divide-border">
      {commits.map((commit) => (
        <a
          key={commit.sha}
          href={commit.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors"
        >
          <GitCommit className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground truncate">
              {truncate(commit.commit.message.split("\n")[0], 80)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {commit.author?.login ?? commit.commit.author.name} &middot;{" "}
              {formatRelativeDate(commit.commit.author.date)}
            </p>
          </div>
          <code className="text-xs text-muted-foreground font-mono shrink-0">
            {commit.sha.slice(0, 7)}
          </code>
        </a>
      ))}
    </div>
  );
}