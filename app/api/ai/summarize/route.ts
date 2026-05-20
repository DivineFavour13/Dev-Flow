import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Groq from "groq-sdk";
import type { RepoSummaryInput, RepoSummaryOutput } from "@/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

const SYSTEM_PROMPT = `You are a senior software engineer analyzing GitHub repositories.
Given repository metadata, return a structured JSON analysis with NO preamble or markdown.
Return only valid JSON matching this exact shape:
{
  "overview": "2-3 sentence summary of what the project does",
  "techStack": ["Technology 1", "Technology 2"],
  "keyFeatures": ["Feature 1", "Feature 2", "Feature 3"],
  "codeQuality": "1-2 sentence assessment of code quality indicators",
  "suggestions": ["Suggestion 1", "Suggestion 2"]
}`;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: RepoSummaryInput = await req.json();
  const { name, description, languages, readme, fileTree } = body;

  if (!name) {
    return NextResponse.json({ error: "Repo name required" }, { status: 400 });
  }

  const languageList = Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .map(([lang]) => lang)
    .join(", ");

  const userPrompt = `
Repository: ${name}
Description: ${description ?? "No description provided"}
Languages: ${languageList}
${fileTree ? `\nFile Tree:\n${fileTree}` : ""}

README (first 3000 chars):
${readme.slice(0, 3000)}
`.trim();

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    });

    const text = completion.choices[0]?.message?.content ?? "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed: RepoSummaryOutput = JSON.parse(clean);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[ai/summarize]", err);
    return NextResponse.json(
      { error: "AI summarization failed" },
      { status: 500 }
    );
  }
}