import type { Task, Label, TaskStatus, Priority } from "@prisma/client";

export type { TaskStatus, Priority };

export type TaskWithLabels = Task & {
  labels: Array<{
    label: Label;
  }>;
};

export type KanbanColumn = {
  id: TaskStatus;
  title: string;
  tasks: TaskWithLabels[];
};

export type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
  private: boolean;
  topics: string[];
};

export type GitHubCommit = {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
  author: {
    login: string;
    avatar_url: string;
  } | null;
};

export type GitHubIssue = {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  html_url: string;
  labels: Array<{ name: string; color: string }>;
  created_at: string;
  updated_at: string;
};

export type ContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export type RepoSummaryInput = {
  name: string;
  description: string | null;
  languages: Record<string, number>;
  readme: string;
  fileTree?: string;
};

export type RepoSummaryOutput = {
  overview: string;
  techStack: string[];
  keyFeatures: string[];
  codeQuality: string;
  suggestions: string[];
};

export type SearchResult =
  | { type: "task"; item: TaskWithLabels }
  | { type: "repo"; item: GitHubRepo };

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  githubToken?: string;
};
