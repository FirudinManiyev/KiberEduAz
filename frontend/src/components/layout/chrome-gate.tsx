"use client";

import { usePathname } from "next/navigation";

const BARE_ROUTES = ["/login", "/register"];

/// Keeps the header and footer off the sign-in screens without splitting the
/// root layout, which would mean re-declaring fonts and global effects.
export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (BARE_ROUTES.some((route) => pathname.startsWith(route))) {
    return null;
  }

  return <>{children}</>;
}
