"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const [loading, setLoading] = useState(false);

  async function handleGitHubSignIn() {
    setLoading(true);
    await signIn("github", { callbackUrl: "/" });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-sm px-8 py-10 rounded-xl border border-border bg-card"
    >
      <div className="mb-8">
        <div className="w-8 h-8 rounded-md bg-foreground mb-4" />
        <h1 className="text-xl font-semibold text-foreground">
          Sign in to DevFlow
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connect your GitHub to get started
        </p>
      </div>

      <button
        onClick={handleGitHubSignIn}
        disabled={loading}
        className={cn(
          "w-full flex items-center justify-center gap-2.5",
          "h-10 px-4 rounded-lg text-sm font-medium",
          "bg-foreground text-background",
          "hover:opacity-90 transition-opacity",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
        {loading ? "Redirecting…" : "Continue with GitHub"}
      </button>

      <p className="mt-6 text-xs text-muted-foreground text-center leading-relaxed">
        Your GitHub token is used only to read your repos and activity.
      </p>
    </motion.div>
  );
}