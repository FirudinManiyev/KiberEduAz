export const INITIAL_VISIBLE_ITEMS = 8;

export type ProgressiveListState<T> = {
  visibleItems: T[];
  hiddenCount: number;
  canToggle: boolean;
};

export function getProgressiveListState<T>(
  items: readonly T[],
  expanded: boolean,
  limit = INITIAL_VISIBLE_ITEMS,
): ProgressiveListState<T> {
  const canToggle = items.length > limit;
  const visibleItems = expanded || !canToggle ? [...items] : items.slice(0, limit);

  return {
    visibleItems,
    hiddenCount: Math.max(0, items.length - visibleItems.length),
    canToggle,
  };
}

