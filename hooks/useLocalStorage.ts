import { useState, useCallback } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch (err) {
      console.warn(`[useLocalStorage] Failed to read "${key}"`, err);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const next = typeof value === "function"
            ? (value as (prev: T) => T)(prev)
            : value;
          window.localStorage.setItem(key, JSON.stringify(next));
          return next;
        });
      } catch (err) {
        console.warn(`[useLocalStorage] Failed to write "${key}"`, err);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}
