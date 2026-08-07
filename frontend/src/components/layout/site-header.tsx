"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookOpen, LayoutDashboard, Menu, Route, Trophy, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";

const navigation = [
  { label: "İdarə paneli", href: "/", icon: LayoutDashboard },
  { label: "Roomlar", href: "/rooms", icon: BookOpen },
  { label: "Təlim yolu", href: "/#learning-path", icon: Route },
  { label: "Reytinq", href: "/#leaderboard", icon: Trophy },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/#")) return false;
  return pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#070a0d]/88 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Əsas naviqasiya">
            {navigation.map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                    active
                      ? "bg-white/[0.06] text-white"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {active && (
                    <span className="absolute inset-x-4 -bottom-[17px] h-px bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-amber-300/15 bg-amber-300/[0.06] px-3 py-1.5 text-xs font-semibold text-amber-200 sm:flex">
            <span aria-hidden="true">🔥</span>
            7 günlük seriya
          </div>
          <button
            type="button"
            className="relative grid size-10 place-items-center rounded-xl text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label="Bildirişlər"
          >
            <Bell className="size-[19px]" aria-hidden="true" />
            <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-emerald-400 ring-2 ring-[#070a0d]" />
          </button>
          <button
            type="button"
            className="hidden items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.035] p-1.5 pr-3 transition-colors hover:border-white/[0.14] hover:bg-white/[0.06] sm:flex"
            aria-label="Profil menyusu"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-cyan-400/80 to-blue-600 text-xs font-bold text-slate-950">
              AN
            </span>
            <span className="text-left leading-tight">
              <span className="block text-xs font-semibold text-slate-100">Aylin N.</span>
              <span className="block text-[10px] text-slate-500">Öyrənən</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="grid size-10 place-items-center rounded-xl border border-white/[0.08] text-slate-300 transition-colors hover:bg-white/[0.06] lg:hidden"
            aria-label={menuOpen ? "Menyunu bağla" : "Menyunu aç"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          className="border-t border-white/[0.07] bg-[#080c10] px-4 py-3 lg:hidden"
          aria-label="Mobil naviqasiya"
        >
          <div className="mx-auto grid max-w-[1440px] gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${
                    active ? "bg-emerald-400/10 text-emerald-300" : "text-slate-300 hover:bg-white/[0.05]"
                  }`}
                >
                  <Icon className="size-[18px]" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
