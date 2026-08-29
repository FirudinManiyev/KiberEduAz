import Image from "next/image";
import type { ReactNode } from "react";

type CyberHeroShellProps = {
  children: ReactNode;
  ariaLabelledby: string;
  className?: string;
  priority?: boolean;
};

export function CyberHeroShell({
  children,
  ariaLabelledby,
  className = "",
  priority = true,
}: CyberHeroShellProps) {
  return (
    <section
      className={`cyber-hero relative isolate overflow-hidden border-b border-white/[0.07] ${className}`}
      aria-labelledby={ariaLabelledby}
      data-reveal="none"
    >
      <Image
        src="/images/cyber_background.jpg"
        alt=""
        fill
        priority={priority}
        sizes="100vw"
        className="cyber-hero__image -z-30 object-cover"
        aria-hidden="true"
      />
      <div className="cyber-hero__shade absolute inset-0 -z-20" aria-hidden="true" />
      <div className="cyber-hero__lights absolute inset-0 -z-20" aria-hidden="true" />
      <div className="cyber-grid absolute inset-0 -z-10 opacity-[0.16]" aria-hidden="true" />
      <div className="hero-scan -z-10" aria-hidden="true" />
      <div className="cyber-hero__orb cyber-hero__orb--red" aria-hidden="true" />
      <div className="cyber-hero__orb cyber-hero__orb--green" aria-hidden="true" />
      {children}
    </section>
  );
}
