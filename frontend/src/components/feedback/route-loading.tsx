import { LoaderCircle, ShieldCheck } from "lucide-react";

type RouteLoadingProps = {
  label?: string;
  compact?: boolean;
};

export function RouteLoading({
  label = "Səhifə hazırlanır",
  compact = false,
}: RouteLoadingProps) {
  return (
    <main
      className={`route-loading flex-1 ${compact ? "min-h-[44vh]" : "min-h-[70vh]"}`}
      aria-label={label}
      aria-live="polite"
      aria-busy="true"
      role="status"
    >
      <div className="route-loading__beam" aria-hidden="true" />
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-red-300/12 bg-red-300/[0.045] px-3 py-1.5 text-[10px] font-semibold text-red-100">
          <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
          {label}…
        </div>
        <div className="flex items-center gap-3" aria-hidden="true">
          <span className="grid size-10 place-items-center rounded-xl border border-emerald-300/15 bg-emerald-300/[0.05] text-emerald-300">
            <ShieldCheck className="size-4.5" />
          </span>
          <div className="w-full max-w-sm">
            <div className="skeleton-line h-3 w-28" />
            <div className="skeleton-line mt-2 h-2.5 w-44" />
          </div>
        </div>
        <div className="skeleton-line mt-8 h-11 max-w-xl" aria-hidden="true" />
        <div className="skeleton-line mt-4 h-4 max-w-2xl" aria-hidden="true" />
        <div
          className={`mt-10 grid gap-5 md:grid-cols-2 ${compact ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}
          aria-hidden="true"
        >
          {(compact ? [0, 1] : [0, 1, 2]).map((item) => (
            <div key={item} className="skeleton-card h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    </main>
  );
}
