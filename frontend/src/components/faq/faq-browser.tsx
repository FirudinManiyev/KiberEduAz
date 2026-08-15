"use client";

import { ChevronDown, Search, ShieldQuestion } from "lucide-react";
import { useMemo, useState } from "react";
import {
  FAQ_CATEGORIES,
  FAQ_ITEMS,
  filterFaqItems,
  type FaqFilter,
} from "@/lib/faq";

const ALL: FaqFilter = "Hamısı";

export function FaqBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FaqFilter>(ALL);
  const visibleItems = useMemo(
    () => filterFaqItems(FAQ_ITEMS, query, category),
    [category, query],
  );

  return (
    <div>
      <div className="rounded-2xl border border-red-300/10 bg-[#1a1d20]/90 p-4 shadow-xl backdrop-blur sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <label htmlFor="faq-search" className="sr-only">FAQ daxilində axtar</label>
          <input id="faq-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Məsələn: progress, şifrə, müəllim…" className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/20 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-emerald-300/35 focus:ring-2 focus:ring-emerald-300/10" />
        </div>
        <div className="mt-3 flex max-w-full gap-1 overflow-x-auto pb-1" role="group" aria-label="FAQ kateqoriyası">
          {[ALL, ...FAQ_CATEGORIES].map((item) => (
            <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={`shrink-0 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${category === item ? "bg-red-400/12 text-red-100 ring-1 ring-red-300/20" : "text-slate-500 hover:bg-white/[0.035] hover:text-slate-200"}`}>
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 mt-6 flex items-center justify-between text-xs text-slate-500" aria-live="polite">
        <span>{visibleItems.length} cavab tapıldı</span>
        {(query || category !== ALL) && <button type="button" onClick={() => { setQuery(""); setCategory(ALL); }} className="font-semibold text-red-300 transition-colors hover:text-red-200">Filtrləri təmizlə</button>}
      </div>

      {visibleItems.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 md:items-start">
          {visibleItems.map((item) => (
            <details key={item.id} className="faq-card group rounded-2xl border border-white/[0.075] bg-[#191c1e] transition-all open:border-red-300/20 open:bg-red-300/[0.025]">
              <summary className="flex cursor-pointer list-none items-start gap-3 p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400 sm:p-6">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-emerald-300/12 bg-emerald-300/[0.055] text-emerald-300 transition-transform duration-300 group-open:rotate-3"><ShieldQuestion className="size-4" aria-hidden="true" /></span>
                <span className="min-w-0 flex-1"><span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-red-300">{item.category}</span><span className="mt-1.5 block text-sm font-semibold leading-6 text-slate-100">{item.question}</span></span>
                <ChevronDown className="mt-1 size-4 shrink-0 text-slate-600 transition-transform duration-300 group-open:rotate-180 group-open:text-emerald-300" aria-hidden="true" />
              </summary>
              <div className="faq-answer border-t border-white/[0.06] px-5 py-5 text-sm leading-7 text-slate-400 sm:px-6">{item.answer}</div>
            </details>
          ))}
        </div>
      ) : (
        <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.015] p-8 text-center">
          <div><ShieldQuestion className="mx-auto size-8 text-slate-600" /><h2 className="mt-4 text-base font-semibold text-slate-200">Uyğun cavab tapılmadı</h2><p className="mt-2 text-sm text-slate-500">Axtarış sözünü qısalt və ya başqa kateqoriya seç.</p></div>
        </div>
      )}
    </div>
  );
}

