import Silk from "./Silk";

export function GlobalSilkBackground() {
  return (
    <div className="global-silk-background" aria-hidden="true">
      <Silk
        speed={5.1}
        scale={0.7}
        color="#1b0d56"
        noiseIntensity={1.2}
        rotation={0}
      />
    </div>
  );
}
