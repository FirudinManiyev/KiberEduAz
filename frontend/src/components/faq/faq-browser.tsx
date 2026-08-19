"use client";

import { ChevronDown, ShieldQuestion } from "lucide-react";
import { useState } from "react";
import {
  FAQ_CATEGORIES,
  FAQ_ITEMS,
  filterFaqItems,
  type FaqFilter,
} from "@/lib/faq";

const ALL: FaqFilter = "Hamısı";

export function FaqBrowser() {
  const [category, setCategory] = useState<FaqFilter>(ALL);
  const visibleItems = filterFaqItems(FAQ_ITEMS, category);

  return (
    <div>
      <div className="rounded-2xl border border-red-300/10 bg-[#1a1d20]/90 p-3 shadow-xl backdrop-blur sm:p-4">
        <div className="flex max-w-full gap-1 overflow-x-auto pb-1" role="group" aria-label="FAQ kateqoriyası">
          {[ALL, ...FAQ_CATEGORIES].map((item) => (
            <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={`shrink-0 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${category === item ? "bg-red-400/12 text-red-100 ring-1 ring-red-300/20" : "text-slate-500 hover:bg-white/[0.035] hover:text-slate-200"}`}>
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 mt-6 flex items-center justify-between text-xs text-slate-500" aria-live="polite">
        <span>{visibleItems.length} cavab göstərilir</span>
        {category !== ALL && <button type="button" onClick={() => setCategory(ALL)} className="font-semibold text-red-300 transition-colors hover:text-red-200">Bütün sualları göstər</button>}
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
          <div><ShieldQuestion className="mx-auto size-8 text-slate-600" /><h2 className="mt-4 text-base font-semibold text-slate-200">Bu kateqoriya hələ boşdur</h2><p className="mt-2 text-sm text-slate-500">Başqa kateqoriya seçərək suallara bax.</p></div>
        </div>
      )}
    </div>
  );
}
