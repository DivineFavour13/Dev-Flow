import { useQuery } from "@tanstack/react-query";
import type { GitHubRepo, ContributionDay } from "@/types";

const GITHUB_STALE_TIME = 7 * 60 * 1000;

async function fetchGitHub<T>(resource: string): Promise<T> {
  const res = await fetch(`/api/github?resource=${resource}`);
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}

export function useRepos() {
  return useQuery<GitHubRepo[]>({
    queryKey: ["github", "repos"],
    queryFn: () => fetchGitHub<GitHubRepo[]>("repos"),
    staleTime: GITHUB_STALE_TIME,
  });
}

export function useGitHubActivity() {
  return useQuery<ContributionDay[]>({
    queryKey: ["github", "activity"],
    queryFn: () => fetchGitHub<ContributionDay[]>("activity"),
    staleTime: GITHUB_STALE_TIME,
  });
}

export function useGitHubProfile() {
  return useQuery({
    queryKey: ["github", "profile"],
    queryFn: () =>
      fetchGitHub<{ login: string; avatar_url: string; name: string }>(
        "profile"
      ),
    staleTime: GITHUB_STALE_TIME,
  });
}