export type AcidRenderProfileInput = {
  width: number;
  coarsePointer: boolean;
  reducedMotion: boolean;
  devicePixelRatio: number;
};

export type AcidRenderProfile = {
  detail: "low" | "medium";
  steps: 20 | 32;
  dpr: number;
  blur: 0 | 0.53;
  mouseInteraction: boolean;
  animate: boolean;
};

export function getAcidRenderProfile({
  width,
  coarsePointer,
  reducedMotion,
  devicePixelRatio,
}: AcidRenderProfileInput): AcidRenderProfile {
  const lowCost = reducedMotion || coarsePointer || width < 768;

  if (lowCost) {
    return {
      detail: "low",
      steps: 20,
      dpr: 1,
      blur: 0,
      mouseInteraction: false,
      animate: false,
    };
  }

  return {
    detail: "medium",
    steps: 32,
    dpr: Math.min(Math.max(devicePixelRatio || 1, 1), 1.35),
    blur: 0.53,
    mouseInteraction: true,
    animate: true,
  };
}
