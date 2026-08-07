import Link from "next/link";
import { ShieldCheck } from "lucide-react";

type LogoProps = {
  compact?: boolean;
};

export function Logo({ compact = false }: LogoProps) {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      aria-label="KiberEduAz — əsas səhifə"
    >
      <span className="relative grid size-9 place-items-center overflow-hidden rounded-xl border border-emerald-400/35 bg-emerald-400/10 text-emerald-300 shadow-[0_0_24px_rgba(52,211,153,0.12)] transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
        <span className="absolute inset-x-1 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent" />
        <ShieldCheck className="size-[19px]" strokeWidth={1.8} aria-hidden="true" />
      </span>
      {!compact && (
        <span className="text-[17px] font-semibold tracking-[-0.035em] text-white">
          KiberEdu<span className="text-emerald-400">Az</span>
        </span>
      )}
    </Link>
  );
}
