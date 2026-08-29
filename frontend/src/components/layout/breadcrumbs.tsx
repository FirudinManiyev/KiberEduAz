"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { usePathname } from "next/navigation";
import { LinkLoadingIndicator } from "@/components/feedback/link-loading-indicator";
import { breadcrumbsForPathname } from "@/lib/navigation/breadcrumbs";

export function Breadcrumbs() {
  const pathname = usePathname();
  const items = breadcrumbsForPathname(pathname);

  if (items.length === 0) return null;

  return (
    <div className="relative z-30 border-b border-white/[0.055] bg-[#121416]/80 backdrop-blur-xl">
      <nav
        className="mx-auto flex min-h-9 max-w-[1440px] items-center gap-1.5 overflow-x-auto px-4 py-2 text-[11px] text-slate-600 sm:px-6 lg:px-10"
        aria-label="Səhifə yolu"
      >
        {items.map((item, index) => {
          const current = index === items.length - 1;

          return (
            <span key={`${item.label}-${index}`} className="inline-flex shrink-0 items-center gap-1.5">
              {index > 0 && <ChevronRight className="size-3 text-slate-700" aria-hidden="true" />}
              {item.href && !current ? (
                <Link
                  href={item.href}
                  prefetch
                  className="group inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 transition-colors hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  {index === 0 && <Home className="size-3" aria-hidden="true" />}
                  {item.label}
                  <LinkLoadingIndicator />
                </Link>
              ) : (
                <span className="px-1 py-0.5 font-medium text-slate-400" aria-current="page">
                  {item.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>
    </div>
  );
}

