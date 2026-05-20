import { Octokit } from "octokit";
import type {
  GitHubRepo,
  GitHubCommit,
  GitHubIssue,
  ContributionDay,
} from "@/types";

export function createOctokit(accessToken: string) {
  return new Octokit({ auth: accessToken });
}

export async function getUserRepos(
  accessToken: string,
  options: { per_page?: number; sort?: "updated" | "pushed" | "created" } = {}
): Promise<GitHubRepo[]> {
  const octokit = createOctokit(accessToken);
  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    per_page: options.per_page ?? 30,
    sort: options.sort ?? "updated",
    visibility: "all",
  });
  return data as GitHubRepo[];
}

export async function getRepo(
  accessToken: string,
  owner: string,
  repo: string
): Promise<GitHubRepo> {
  const octokit = createOctokit(accessToken);
  const { data } = await octokit.rest.repos.get({ owner, repo });
  return data as GitHubRepo;
}

export async function getRepoCommits(
  accessToken: string,
  owner: string,
  repo: string,
  per_page = 10
): Promise<GitHubCommit[]> {
  const octokit = createOctokit(accessToken);
  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
    per_page,
  });
  return data as unknown as GitHubCommit[];
}

export async function getRepoIssues(
  accessToken: string,
  owner: string,
  repo: string,
  state: "open" | "closed" | "all" = "open"
): Promise<GitHubIssue[]> {
  const octokit = createOctokit(accessToken);
  const { data } = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state,
    per_page: 20,
  });
  return data.filter((i) => !i.pull_request) as unknown as GitHubIssue[];
}

export async function getRepoLanguages(
  accessToken: string,
  owner: string,
  repo: string
): Promise<Record<string, number>> {
  const octokit = createOctokit(accessToken);
  const { data } = await octokit.rest.repos.listLanguages({ owner, repo });
  return data;
}

export async function getRepoReadme(
  accessToken: string,
  owner: string,
  repo: string
): Promise<string> {
  const octokit = createOctokit(accessToken);
  try {
    const { data } = await octokit.rest.repos.getReadme({ owner, repo });
    return Buffer.from(data.content, "base64").toString("utf-8");
  } catch {
    return "";
  }
}

export async function getContributionActivity(
  accessToken: string,
  username: string
): Promise<ContributionDay[]> {
  const octokit = createOctokit(accessToken);
  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  const response = await octokit.graphql<{
    user: {
      contributionsCollection: {
        contributionCalendar: {
          weeks: Array<{
            contributionDays: Array<{
              date: string;
              contributionCount: number;
              contributionLevel: string;
            }>;
          }>;
        };
      };
    };
  }>(query, { login: username });

  const levelMap: Record<string, 0 | 1 | 2 | 3 | 4> = {
    NONE: 0,
    FIRST_QUARTILE: 1,
    SECOND_QUARTILE: 2,
    THIRD_QUARTILE: 3,
    FOURTH_QUARTILE: 4,
  };

  return response.user.contributionsCollection.contributionCalendar.weeks
    .flatMap((week) => week.contributionDays)
    .map((day) => ({
      date: day.date,
      count: day.contributionCount,
      level: levelMap[day.contributionLevel] ?? 0,
    }));
}

export async function getAuthenticatedUser(accessToken: string) {
  const octokit = createOctokit(accessToken);
  const { data } = await octokit.rest.users.getAuthenticated();
  return data;
}