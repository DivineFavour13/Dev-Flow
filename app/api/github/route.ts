import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getUserRepos,
  getContributionActivity,
  getAuthenticatedUser,
  getRepoLanguages,
  getRepoReadme,
  getRepoCommits,
  getRepoIssues,
} from "@/lib/github";

async function getGitHubToken(userId: string): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "github" },
    select: { access_token: true },
  });
  return account?.access_token ?? null;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = await getGitHubToken(session.user.id);
  if (!token) {
    return NextResponse.json({ error: "No GitHub token" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const resource = searchParams.get("resource");
  const owner = searchParams.get("owner") ?? "";
  const repo = searchParams.get("repo") ?? "";

  try {
    switch (resource) {
      case "repos": {
        const repos = await getUserRepos(token, { per_page: 30 });
        return NextResponse.json(repos);
      }

      case "activity": {
        const profile = await getAuthenticatedUser(token);
        const activity = await getContributionActivity(token, profile.login);
        return NextResponse.json(activity);
      }

      case "profile": {
        const profile = await getAuthenticatedUser(token);
        return NextResponse.json(profile);
      }

      case "languages": {
        if (!owner || !repo) return NextResponse.json({});
        const langs = await getRepoLanguages(token, owner, repo);
        return NextResponse.json(langs);
      }

      case "readme": {
        if (!owner || !repo) return NextResponse.json("");
        const readme = await getRepoReadme(token, owner, repo);
        return NextResponse.json(readme);
      }

      case "commits": {
        if (!owner || !repo) return NextResponse.json([]);
        const commits = await getRepoCommits(token, owner, repo, 15);
        return NextResponse.json(commits);
      }

      case "issues": {
        if (!owner || !repo) return NextResponse.json([]);
        const issues = await getRepoIssues(token, owner, repo);
        return NextResponse.json(issues);
      }

      default:
        return NextResponse.json({ error: "Unknown resource" }, { status: 400 });
    }
  } catch (err) {
    console.error("[github api]", err);
    return NextResponse.json({ error: "GitHub API error" }, { status: 502 });
  }
}