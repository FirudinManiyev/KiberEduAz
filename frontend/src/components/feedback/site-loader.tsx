"use client";

import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand/logo";

export function SiteLoader() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setLeaving(true), 950);
    const removeTimer = window.setTimeout(() => setVisible(false), 1320);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`site-loader ${leaving ? "site-loader--leaving" : ""}`} role="status" aria-label="KiberEduAz açılır">
      <div className="site-loader__grid" />
      <div className="site-loader__orb site-loader__orb--red" />
      <div className="site-loader__orb site-loader__orb--green" />
      <div className="site-loader__content">
        <BrandMark size="lg" />
        <div className="site-loader__terminal mt-5">
          <span className="text-emerald-400">$</span>
          <span>sistem hazırlanır</span>
          <span className="site-loader__cursor" />
        </div>
        <div className="site-loader__bar mt-6"><span /></div>
        <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-600">təhlükəsiz təlim mühiti qurulur</p>
      </div>
    </div>
  );
}
