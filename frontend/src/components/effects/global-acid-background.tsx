import AcidSquares from "@/components/effects/acid-squares";

export function GlobalAcidBackground() {
  return (
    <div className="global-acid-background" aria-hidden="true">
      <AcidSquares
        color1="#10B981"
        color2="#EF4444"
        color3="#ffffff"
        detail="medium"
        speed={1}
        waveDepth={1.7}
        zoom={1.1}
        density={9.5}
        glow={1.2}
        exposure={2300}
        spread={0.3}
        stepSize={0.002}
        colorShift={0}
        contrast={1}
        brightness={1}
        opacity={1}
        mouseInteraction
        mouseStrength={0.15}
        mouseRadius={0.29}
        blur={0.53}
        grain
        grainIntensity={0.04}
      />
    </div>
  );
}
