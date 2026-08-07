type ProgressRingProps = {
  value: number;
  size?: number;
  accent?: "green" | "blue";
};

export function ProgressRing({ value, size = 48, accent = "green" }: ProgressRingProps) {
  const color = accent === "green" ? "#34d399" : "#38bdf8";

  return (
    <div
      className="relative grid shrink-0 place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${color} ${value * 3.6}deg, rgba(148,163,184,.12) 0deg)`,
      }}
      role="img"
      aria-label={`${value}% tamamlanıb`}
    >
      <div className="absolute inset-[4px] rounded-full bg-[#0d1217]" />
      <span className="relative text-[11px] font-bold text-white">{value}%</span>
    </div>
  );
}
