const REBALANCE_THRESHOLD = 1e-10;
const REBALANCE_TRIGGER_MOVES = 100;

export function calculatePosition(
  prev: { position: number } | null,
  next: { position: number } | null
): number {
  if (!prev && !next) return 1;
  if (!prev) return next!.position - 1;
  if (!next) return prev.position + 1;
  return (prev.position + next.position) / 2;
}

export function needsRebalance(
  tasks: { position: number }[],
  moveCount: number
): boolean {
  if (moveCount > 0 && moveCount % REBALANCE_TRIGGER_MOVES === 0) return true;

  for (let i = 1; i < tasks.length; i++) {
    if (tasks[i].position - tasks[i - 1].position < REBALANCE_THRESHOLD) {
      return true;
    }
  }

  return false;
}

export function rebalancePositions<T extends { id: string; position: number }>(
  tasks: T[]
): Array<Pick<T, "id"> & { position: number }> {
  return tasks
    .sort((a, b) => a.position - b.position)
    .map((task, index) => ({ id: task.id, position: index + 1 }));
}