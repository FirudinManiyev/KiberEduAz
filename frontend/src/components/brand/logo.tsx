import Link from "next/link";

type BrandMarkProps = {
  size?: "sm" | "md" | "lg";
};

export function BrandMark({ size = "md" }: BrandMarkProps) {
  return (
    <span className={`brand-mark brand-mark--${size}`} aria-hidden="true">
      <span className="brand-mark__scan" />
      <span className="brand-mark__letter">K</span>
      <span className="brand-mark__status" />
    </span>
  );
}

type LogoProps = {
  compact?: boolean;
};

export function Logo({ compact = false }: LogoProps) {
  return (
    <Link
      href="/"
      prefetch
      className="group inline-flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      aria-label="KiberEduAz — əsas səhifə"
    >
      <BrandMark />
      {!compact && (
        <span className="text-[17px] font-semibold tracking-[-0.04em] text-white">
          KiberEdu<span className="text-emerald-400 transition-colors group-hover:text-red-400">Az</span>
        </span>
      )}
    </Link>
  );
}
