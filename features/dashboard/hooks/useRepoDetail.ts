import { useQuery } from "@tanstack/react-query";
import type { GitHubCommit, GitHubIssue } from "@/types";

const STALE = 7 * 60 * 1000;

async function fetchGitHub<T>(
  resource: string,
  params: Record<string, string> = {}
): Promise<T> {
  const qs = new URLSearchParams({ resource, ...params }).toString();
  const res = await fetch(`/api/github?${qs}`);
  if (!res.ok) throw new Error(`GitHub API error ${res.status}`);
  return res.json();
}

export function useRepoLanguages(owner: string, repo: string) {
  return useQuery<Record<string, number>>({
    queryKey: ["github", "languages", owner, repo],
    queryFn: () => fetchGitHub("languages", { owner, repo }),
    staleTime: STALE,
    enabled: !!owner && !!repo,
  });
}

export function useRepoReadme(owner: string, repo: string) {
  return useQuery<string>({
    queryKey: ["github", "readme", owner, repo],
    queryFn: () => fetchGitHub("readme", { owner, repo }),
    staleTime: STALE,
    enabled: !!owner && !!repo,
  });
}

export function useRepoCommits(owner: string, repo: string) {
  return useQuery<GitHubCommit[]>({
    queryKey: ["github", "commits", owner, repo],
    queryFn: () => fetchGitHub("commits", { owner, repo }),
    staleTime: STALE,
    enabled: !!owner && !!repo,
  });
}

export function useRepoIssues(owner: string, repo: string) {
  return useQuery<GitHubIssue[]>({
    queryKey: ["github", "issues", owner, repo],
    queryFn: () => fetchGitHub("issues", { owner, repo }),
    staleTime: STALE,
    enabled: !!owner && !!repo,
  });
}