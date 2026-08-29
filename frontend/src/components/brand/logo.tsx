import Image from "next/image";
import Link from "next/link";

type BrandMarkProps = {
  size?: "sm" | "md" | "lg";
  alt?: string;
};

const BRAND_ALT = "KiberEduAz — Kibertəhlükəsizlik Öyrənmə Platforması";

export function BrandMark({ size = "md", alt = "" }: BrandMarkProps) {
  return (
    <span className={`brand-mark brand-mark--${size}`} aria-hidden={alt ? undefined : true}>
      <Image
        src="/kibereduaz_logo.png"
        alt={alt}
        width={2154}
        height={922}
        sizes={size === "lg" ? "216px" : size === "sm" ? "104px" : "152px"}
        className="brand-mark__image"
      />
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
      className="group inline-flex items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      aria-label={`${BRAND_ALT} — əsas səhifə`}
    >
      <BrandMark size={compact ? "sm" : "md"} alt={BRAND_ALT} />
    </Link>
  );
}
