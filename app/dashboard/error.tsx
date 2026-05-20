"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[dashboard error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-red-400" />
      </div>
      <h2 className="text-base font-semibold text-foreground mb-1">
        Something went wrong
      </h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        {error.message || "An unexpected error occurred. Try refreshing the page."}
      </p>
      <Button onClick={reset} size="sm" variant="outline">
        <RotateCcw className="w-3.5 h-3.5" />
        Try again
      </Button>
    </div>
  );
}