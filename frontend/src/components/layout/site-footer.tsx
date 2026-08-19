import Link from "next/link";
import { Logo } from "@/components/brand/logo";

type SiteFooterProps = {
  signedIn?: boolean;
};

export function SiteFooter({ signedIn = false }: SiteFooterProps) {
  const links = signedIn
    ? [
        { href: "/dashboard", label: "İdarə paneli", tone: "emerald" as const },
        { href: "/rooms", label: "Room-lar", tone: "emerald" as const },
        { href: "/roadmap", label: "Roadmap", tone: "emerald" as const },
        { href: "/faq", label: "FAQ", tone: "red" as const },
        { href: "/contact", label: "Əlaqə", tone: "red" as const },
        { href: "/notifications", label: "Bildirişlər", tone: "red" as const },
        { href: "/profile", label: "Profil", tone: "emerald" as const },
      ]
    : [
        { href: "/", label: "Ana səhifə", tone: "emerald" as const },
        { href: "/faq", label: "FAQ", tone: "red" as const },
        { href: "/contact", label: "Əlaqə", tone: "red" as const },
        { href: "/login", label: "Daxil ol", tone: "emerald" as const },
        { href: "/register", label: "Qeydiyyat", tone: "emerald" as const },
      ];

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] bg-[#151719]">
      <div className="header-signal-line opacity-30" />
      <div className="cyber-grid absolute inset-0 opacity-[0.08]" />
      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-xs leading-5 text-slate-600">
            Azərbaycanın məktəb və kollecləri üçün praktiki İT və kibertəhlükəsizlik təlim mühiti.
          </p>
        </div>
        <nav
          className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500"
          aria-label="Alt naviqasiya"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                link.tone === "red"
                  ? "transition-colors hover:text-red-300"
                  : "transition-colors hover:text-emerald-300"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 text-[10px] text-slate-700">
          <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.6)]" />
          KiberEduAz · © 2026
        </div>
      </div>
    </footer>
  );
}
