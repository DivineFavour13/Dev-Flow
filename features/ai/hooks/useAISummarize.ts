import { useMutation } from "@tanstack/react-query";
import type { RepoSummaryInput, RepoSummaryOutput } from "@/types";

export function useAISummarize() {
  return useMutation<RepoSummaryOutput, Error, RepoSummaryInput>({
    mutationFn: async (input) => {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Summarization failed");
      return res.json();
    },
  });
}