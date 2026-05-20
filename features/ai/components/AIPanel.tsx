"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, ChevronUp, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAISummarize } from "@/features/ai/hooks/useAISummarize";
import { cn } from "@/lib/utils";
import type { GitHubRepo, RepoSummaryOutput } from "@/types";

type Props = {
  repo: GitHubRepo;
  readme: string;
  languages: Record<string, number>;
};

export function AIPanel({ repo, readme, languages }: Props) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<RepoSummaryOutput | null>(null);
  const summarize = useAISummarize();

  async function handleSummarize() {
    if (result) {
      setOpen((o) => !o);
      return;
    }

    setOpen(true);
    const output = await summarize.mutateAsync({
      name: repo.name,
      description: repo.description,
      languages,
      readme,
    });
    setResult(output);
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        onClick={handleSummarize}
        disabled={summarize.isPending}
        className={cn(
          "w-full flex items-center gap-2.5 px-4 py-3 text-sm",
          "bg-card hover:bg-muted transition-colors",
          "disabled:opacity-60 disabled:cursor-not-allowed"
        )}
      >
        {summarize.isPending ? (
          <Loader2 className="w-4 h-4 text-muted-foreground animate-spin shrink-0" />
        ) : (
          <Sparkles className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
        <span className="text-foreground font-medium flex-1 text-left">
          {summarize.isPending
            ? "Analyzing repository…"
            : result
            ? "AI Summary"
            : "Summarize with AI"}
        </span>
        {result &&
          (open ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ))}
      </button>

      {summarize.isError && (
        <div className="px-4 py-3 flex items-center gap-2 text-sm text-red-400 bg-red-500/5 border-t border-border">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Failed to analyze. Check your API key and try again.
        </div>
      )}

      <AnimatePresence initial={false}>
        {open && result && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border"
          >
            <div className="px-4 py-4 space-y-4 bg-card">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  Overview
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {result.overview}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Tech Stack
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.techStack.map((tech) => (
                    <Badge key={tech} variant="info">{tech}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Key Features
                </p>
                <ul className="space-y-1">
                  {result.keyFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="text-muted-foreground mt-0.5 shrink-0">·</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  Code Quality
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {result.codeQuality}
                </p>
              </div>

              {result.suggestions.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Suggestions
                  </p>
                  <ul className="space-y-1">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-0.5 shrink-0">→</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setResult(null);
                  summarize.reset();
                }}
                className="text-muted-foreground"
              >
                Clear summary
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}