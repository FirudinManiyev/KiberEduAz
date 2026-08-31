export type RevealVariant = "focus" | "left" | "right" | "rise";
export type RevealAccent = "red" | "green";

export type RevealMotionProfile = {
  variant: RevealVariant;
  accent: RevealAccent;
};

const REVEAL_VARIANTS: readonly RevealVariant[] = ["focus", "left", "right", "rise"];

function safeIndex(index: number): number {
  return Number.isFinite(index) ? Math.max(0, Math.floor(index)) : 0;
}

export function getRevealMotionProfile(index: number): RevealMotionProfile {
  const normalizedIndex = safeIndex(index);

  return {
    variant: REVEAL_VARIANTS[normalizedIndex % REVEAL_VARIANTS.length],
    accent: normalizedIndex % 2 === 0 ? "red" : "green",
  };
}

export function getRevealChildDelay(index: number): number {
  return Math.min(safeIndex(index) * 85, 340);
}
