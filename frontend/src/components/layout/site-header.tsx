"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  HelpCircle,
  LayoutDashboard,
  LogIn,
  Map,
  Menu,
  MessageCircle,
  Shield,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Logo } from "@/components/brand/logo";
import { LinkLoadingIndicator } from "@/components/feedback/link-loading-indicator";
import type { UserRole } from "@/lib/api/types";
import {
  mobileNavigationFor,
  navigationFor,
  type NavigationIcon,
} from "@/lib/navigation";

const NAVIGATION_ICONS: Record<NavigationIcon, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  rooms: BookOpen,
  roadmap: Map,
  contact: MessageCircle,
  faq: HelpCircle,
  shield: Shield,
  notifications: Bell,
  profile: UserRound,
  login: LogIn,
  register: UserPlus,
};

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type SiteHeaderUser = {
  name: string;
  initials: string;
  points: number;
  role: UserRole;
  pending: boolean;
  homeHref: string;
};

type SiteHeaderProps = {
  user: SiteHeaderUser | null;
  unreadCount: number;
};

export function SiteHeader({ user, unreadCount }: SiteHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const signedIn = Boolean(user);
  const navigation = navigationFor(user?.role, Boolean(user?.pending));

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#151719]/90 backdrop-blur-2xl">
      <div className="header-signal-line" />
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-8 xl:gap-11">
          <Logo />
          <nav className="hidden items-center gap-1 xl:flex" aria-label="Əsas naviqasiya">
            {navigation.map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  prefetch
                  className={`nav-link ${active ? "nav-link--active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <span>{item.label}</span>
                  <LinkLoadingIndicator />
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-300/12 bg-emerald-300/[0.045] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-300 xl:flex">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
            </span>
            Sistem aktivdir
          </div>

          {user ? (
            <>
              {!user.pending && (
                <Link
                  href="/notifications"
                  prefetch
                  className={`relative inline-flex size-10 items-center justify-center rounded-xl border transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 ${
                    pathname === "/notifications"
                      ? "border-red-300/25 bg-red-400/10 text-red-300"
                      : "border-transparent text-slate-400 hover:border-white/[0.08] hover:bg-white/[0.055] hover:text-white"
                  }`}
                  aria-label="Bildirişlər"
                >
                  <Bell className="block size-[19px] shrink-0" aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 grid size-3.5 place-items-center rounded-full bg-red-500 text-[8px] font-black leading-none text-white ring-2 ring-[#151719]">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                  <span className="absolute bottom-1 left-1/2 flex -translate-x-1/2 leading-none">
                    <LinkLoadingIndicator />
                  </span>
                </Link>
              )}

              <Link
                href={user.pending ? "/pending" : "/profile"}
                prefetch
                className={`hidden items-center gap-2.5 rounded-xl border p-1.5 pr-3 transition-all hover:-translate-y-0.5 sm:flex ${
                  pathname === "/profile" || pathname === "/pending"
                    ? "border-emerald-300/20 bg-emerald-300/[0.07]"
                    : "border-white/[0.08] bg-white/[0.025] hover:border-white/[0.15] hover:bg-white/[0.05]"
                }`}
              >
                <span className="avatar-pulse relative grid size-8 place-items-center rounded-lg bg-gradient-to-br from-red-500 to-red-900 text-xs font-bold text-white">
                  {user.initials}
                </span>
                <span className="text-left leading-tight">
                  <span className="block text-xs font-semibold text-slate-100">{user.name}</span>
                  <span className="block text-[10px] text-slate-500">
                    {user.pending
                      ? "Gözləmədə"
                      : user.role === "ADMIN"
                        ? "Admin"
                        : user.role === "TEACHER"
                          ? "Müəllim"
                          : `${user.points.toLocaleString("az-AZ")} XP`}
                  </span>
                </span>
                <LinkLoadingIndicator />
              </Link>
              <div className="hidden xl:block">
                <SignOutButton variant="header" />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                prefetch
                className="hidden items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 py-2 text-xs font-semibold text-slate-200 transition-all hover:-translate-y-0.5 hover:border-white/[0.15] hover:bg-white/[0.05] sm:inline-flex"
              >
                <LogIn className="size-3.5" aria-hidden="true" />
                Daxil ol
                <LinkLoadingIndicator />
              </Link>
              <Link href="/register" prefetch className="primary-action !h-10 !px-4 !text-xs sm:!text-sm">
                <span className="relative z-10 inline-flex items-center gap-2">
                  <UserPlus className="size-3.5" aria-hidden="true" />
                  Qeydiyyat
                </span>
                <span className="relative z-10">
                  <LinkLoadingIndicator />
                </span>
                <span className="button-sheen" />
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="grid size-10 place-items-center rounded-xl border border-white/[0.08] text-slate-300 transition-all hover:rotate-3 hover:bg-white/[0.06] xl:hidden"
            aria-label={menuOpen ? "Menyunu bağla" : "Menyunu aç"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          className="mobile-nav-enter border-t border-white/[0.07] bg-[#17191b] px-4 py-3 xl:hidden"
          aria-label="Mobil naviqasiya"
        >
          <div className="mx-auto grid max-w-[1440px] gap-1">
            {mobileNavigationFor(user?.role, Boolean(user?.pending), signedIn).map((item) => {
              if (item.kind === "signout") {
                return <SignOutButton key={item.kind} variant="mobile" onAction={() => setMenuOpen(false)} />;
              }

              const Icon = NAVIGATION_ICONS[item.icon];
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  prefetch
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
                    active
                      ? "border-emerald-300/15 bg-emerald-400/[0.08] text-emerald-300"
                      : "border-transparent text-slate-300 hover:translate-x-1 hover:border-white/[0.06] hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon className="size-[18px]" aria-hidden="true" />
                  <span className="flex-1">{item.label}</span>
                  <LinkLoadingIndicator />
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
