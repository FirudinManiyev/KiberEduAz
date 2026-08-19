"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { scrollToPageTop } from "@/lib/navigation/scroll";

export default function Template({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  useEffect(() => {
    scrollToPageTop(window.scrollTo.bind(window));
  }, [pathname]);

  return <div className="page-transition">{children}</div>;
}
