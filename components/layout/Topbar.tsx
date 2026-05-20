"use client";

import { Sun, Moon, Command } from "lucide-react";
import { useUIStore } from "@/store/ui";
import { cn } from "@/lib/utils";

export function Topbar() {
  const { theme, toggleTheme, openCommandPalette } = useUIStore();

  return (
    <header className="h-14 border-b border-border flex items-center justify-end px-6 gap-2 shrink-0">
      <button
        onClick={openCommandPalette}
        className={cn(
          "flex items-center gap-2 h-8 px-3 rounded-md text-xs",
          "text-muted-foreground border border-border",
          "hover:bg-muted hover:text-foreground transition-colors"
        )}
      >
        <Command className="w-3 h-3" />
        <span>Search…</span>
        <kbd className="ml-1 text-xs opacity-50">⌘K</kbd>
      </button>

      <button
        onClick={toggleTheme}
        className={cn(
          "w-8 h-8 rounded-md flex items-center justify-center",
          "text-muted-foreground hover:text-foreground hover:bg-muted",
          "transition-colors"
        )}
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
      </button>
    </header>
  );
}