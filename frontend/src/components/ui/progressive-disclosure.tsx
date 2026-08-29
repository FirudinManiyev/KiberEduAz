import { ChevronDown, ChevronUp } from "lucide-react";

type ProgressiveDisclosureProps = {
  expanded: boolean;
  hiddenCount: number;
  onToggle: () => void;
  className?: string;
};

export function ProgressiveDisclosure({
  expanded,
  hiddenCount,
  onToggle,
  className = "",
}: ProgressiveDisclosureProps) {
  const Icon = expanded ? ChevronUp : ChevronDown;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className={`mx-auto mt-6 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.025] px-5 text-sm font-semibold text-slate-300 transition-all hover:-translate-y-0.5 hover:border-emerald-300/25 hover:bg-emerald-300/[0.06] hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${className}`}
    >
      {expanded ? "Daha az göstər" : `Daha çox göstər (${hiddenCount})`}
      <Icon className="size-4" aria-hidden="true" />
    </button>
  );
}

