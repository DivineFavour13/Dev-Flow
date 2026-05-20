import { useEffect } from "react";

type Modifier = "meta" | "ctrl" | "shift" | "alt";

export function useHotkey(
  key: string,
  callback: (e: KeyboardEvent) => void,
  modifiers: Modifier[] = []
) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const modMatch =
        modifiers.every((mod) => {
          if (mod === "meta") return e.metaKey;
          if (mod === "ctrl") return e.ctrlKey;
          if (mod === "shift") return e.shiftKey;
          if (mod === "alt") return e.altKey;
          return false;
        }) && e.key.toLowerCase() === key.toLowerCase();

      if (modMatch) callback(e);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [key, callback, modifiers]);
}