"use client";

import { useState } from "react";
import { Search, GitBranch } from "lucide-react";
import { useRepos, useGitHubProfile } from "@/features/dashboard/hooks/useGitHubActivity";
import { RepoCard } from "@/features/dashboard/components/RepoCard";
import { RepoDetail } from "@/features/dashboard/components/RepoDetail";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import type { GitHubRepo } from "@/types";

export default function ReposPage() {
  const { data: repos, isLoading } = useRepos();
  const { data: profile } = useGitHubProfile();
  const [selected, setSelected] = useState<GitHubRepo | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 200);

  const filtered = (repos ?? []).filter(
    (r) =>
      r.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (r.description ?? "").toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="flex gap-6 h-full max-w-6xl">
      <div className="w-80 shrink-0 flex flex-col gap-4 overflow-y-auto">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Repositories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {repos ? `${repos.length} repos` : "Loading…"}
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Filter repos…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-foreground/20 transition-colors"
          />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-2">
            {filtered.map((repo) => (
              <RepoCard
                key={repo.id}
                repo={repo}
                selected={selected?.id === repo.id}
                onClick={() =>
                  setSelected((prev) => (prev?.id === repo.id ? null : repo))
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-12 text-muted-foreground">
            <GitBranch className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">No repos match &ldquo;{search}&rdquo;</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {selected && profile ? (
          <RepoDetail repo={selected} owner={profile.login} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <GitBranch className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm">Select a repository to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}