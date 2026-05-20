import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Label } from "@prisma/client";

const LABELS_KEY = ["labels"];

async function fetchLabels(): Promise<Label[]> {
  const res = await fetch("/api/labels");
  if (!res.ok) throw new Error("Failed to fetch labels");
  return res.json();
}

export function useLabels() {
  return useQuery<Label[]>({
    queryKey: LABELS_KEY,
    queryFn: fetchLabels,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; color: string }) => {
      const res = await fetch("/api/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create label");
      return res.json() as Promise<Label>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LABELS_KEY }),
  });
}

export function useDeleteLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/labels/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete label");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LABELS_KEY }),
  });
}