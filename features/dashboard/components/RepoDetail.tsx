"use client";

import { GitCommit, CircleDot, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { AIPanel } from "@/features/ai/components/AIPanel";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  useRepoCommits,
  useRepoIssues,
  useRepoLanguages,
  useRepoReadme,
} from "@/features/dashboard/hooks/useRepoDetail";
import { formatRelativeDate, truncate, getLanguageColor } from "@/lib/utils";
import type { GitHubRepo } from "@/types";

type Props = {
  repo: GitHubRepo;
  owner: string;
};

export function RepoDetail({ repo, owner }: Props) {
  const { data: languages, isLoading: langsLoading } = useRepoLanguages(owner, repo.name);
  const { data: readme = "", isLoading: readmeLoading } = useRepoReadme(owner, repo.name);
  const { data: commits, isLoading: commitsLoading } = useRepoCommits(owner, repo.name);
  const { data: issues, isLoading: issuesLoading } = useRepoIssues(owner, repo.name);

  const totalBytes = Object.values(languages ?? {}).reduce((a, b) => a + b, 0);

  return (
    <motion.div
      key={repo.id}
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="text-base font-semibold text-foreground">{repo.name}</h2>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open
          </a>
        </div>
        {repo.description && (
          <p className="text-sm text-muted-foreground">{repo.description}</p>
        )}
      </div>

      {langsLoading ? (
        <Skeleton className="h-16 rounded-xl" />
      ) : languages && Object.keys(languages).length > 0 ? (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Languages
          </p>
          <div className="flex rounded-full overflow-hidden h-2 mb-3">
            {Object.entries(languages)
              .sort(([, a], [, b]) => b - a)
              .map(([lang, bytes]) => (
                <div
                  key={lang}
                  style={{
                    width: `${(bytes / totalBytes) * 100}%`,
                    backgroundColor: getLanguageColor(lang),
                  }}
                />
              ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {Object.entries(languages)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 6)
              .map(([lang, bytes]) => (
                <span key={lang} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getLanguageColor(lang) }}
                  />
                  {lang}{" "}
                  <span className="text-muted-foreground/60">
                    {Math.round((bytes / totalBytes) * 100)}%
                  </span>
                </span>
              ))}
          </div>
        </div>
      ) : null}

      {readmeLoading ? (
        <Skeleton className="h-12 rounded-xl" />
      ) : (
        <AIPanel repo={repo} readme={readme} languages={languages ?? {}} />
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 border-b border-border">
          Recent Commits
        </p>
        {commitsLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : commits?.length ? (
          <div className="divide-y divide-border">
            {commits.slice(0, 8).map((commit) => (
              <a
                key={commit.sha}
                href={commit.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <GitCommit className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    {truncate(commit.commit.message.split("\n")[0], 72)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {commit.author?.login ?? commit.commit.author.name} ·{" "}
                    {formatRelativeDate(commit.commit.author.date)}
                  </p>
                </div>
                <code className="text-xs text-muted-foreground font-mono shrink-0">
                  {commit.sha.slice(0, 7)}
                </code>
              </a>
            ))}
          </div>
        ) : (
          <p className="px-4 py-6 text-sm text-muted-foreground text-center">
            No commits found
          </p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 border-b border-border">
          Open Issues
        </p>
        {issuesLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : issues?.length ? (
          <div className="divide-y divide-border">
            {issues.slice(0, 6).map((issue) => (
              <a
                key={issue.id}
                href={issue.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <CircleDot className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{issue.title}</p>
                  {issue.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {issue.labels.map((label) => (
                        <span
                          key={label.name}
                          className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                          style={{
                            backgroundColor: `#${label.color}22`,
                            color: `#${label.color}`,
                          }}
                        >
                          {label.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  #{issue.number}
                </span>
              </a>
            ))}
          </div>
        ) : (
          <p className="px-4 py-6 text-sm text-muted-foreground text-center">
            No open issues 🎉
          </p>
        )}
      </div>
    </motion.div>
  );
}
