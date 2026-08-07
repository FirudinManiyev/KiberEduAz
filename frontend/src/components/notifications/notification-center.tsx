"use client";

import Link from "next/link";
import { Award, BellRing, BookOpen, CheckCheck, Flame, Info, ShieldAlert, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { LinkLoadingIndicator } from "@/components/feedback/link-loading-indicator";

type NotificationType = "training" | "achievement" | "system";

type NotificationItem = {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  href?: string;
};

const initialNotifications: NotificationItem[] = [
  { id: 1, type: "training", title: "GRC əsasları Room-u açıldı", body: "İdarəetmə, risk və uyğunluq mövzusunda yeni analiz missiyası səni gözləyir.", time: "8 dəq əvvəl", unread: true, href: "/rooms/grc-foundations" },
  { id: 2, type: "achievement", title: "7 günlük seriya!", body: "Bir həftə fasiləsiz öyrəndin. Növbəti hədəf: 12 günlük şəxsi rekord.", time: "2 saat əvvəl", unread: true },
  { id: 3, type: "system", title: "Həftəlik progress hesabatın hazırdır", body: "Bu həftə task dəqiqliyini 6% artırmısan və sinifdə 4-cü yerə yüksəlmisən.", time: "Bu gün, 09:30", unread: true },
  { id: 4, type: "achievement", title: "Sinif reytinqində yüksəldin", body: "11A sinfində iki pillə yüksələrək 4-cü yerə çatdın.", time: "Dünən", unread: false },
  { id: 5, type: "training", title: "Pentestinq Room-unda yeni mərhələ", body: "Hüquqi və etik çərçivə taskı artıq açıqdır.", time: "2 gün əvvəl", unread: false, href: "/rooms/intro-to-pentesting" },
  { id: 6, type: "system", title: "KiberEduAz MVP-yə xoş gəldin", body: "İlk Room-u seç, taskları həll et və kiber inkişaf yoluna başla.", time: "4 gün əvvəl", unread: false },
];

const filters = [
  { key: "all", label: "Hamısı" },
  { key: "unread", label: "Oxunmamış" },
  { key: "training", label: "Təlim" },
  { key: "achievement", label: "Nailiyyət" },
] as const;

export function NotificationCenter() {
  const [items, setItems] = useState(initialNotifications);
  const [filter, setFilter] = useState<(typeof filters)[number]["key"]>("all");

  const visibleItems = useMemo(() => items.filter((item) => filter === "all" || (filter === "unread" ? item.unread : item.type === filter)), [filter, items]);
  const unreadCount = items.filter((item) => item.unread).length;

  function markAllRead() {
    setItems((current) => current.map((item) => ({ ...item, unread: false })));
  }

  function markRead(id: number) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, unread: false } : item));
  }

  function iconFor(type: NotificationType) {
    if (type === "training") return BookOpen;
    if (type === "achievement") return Award;
    return Info;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="overflow-hidden rounded-2xl border border-red-300/10 bg-[#1a1d1f]">
        <div className="flex flex-col gap-4 border-b border-white/[0.065] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex gap-1 overflow-x-auto rounded-xl bg-black/25 p-1">
            {filters.map((item) => (
              <button key={item.key} type="button" onClick={() => setFilter(item.key)} className={`shrink-0 rounded-lg px-3 py-2 text-[11px] font-semibold transition-all ${filter === item.key ? "bg-white/[0.09] text-white shadow" : "text-slate-600 hover:text-slate-300"}`}>{item.label}{item.key === "unread" && unreadCount > 0 && <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[8px] text-white">{unreadCount}</span>}</button>
            ))}
          </div>
          <button type="button" onClick={markAllRead} disabled={unreadCount === 0} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.07] px-3 py-2 text-[11px] font-semibold text-slate-500 transition-all hover:border-emerald-300/20 hover:bg-emerald-300/[0.05] hover:text-emerald-300 disabled:opacity-35"><CheckCheck className="size-3.5" />Hamısını oxunmuş et</button>
        </div>

        <div className="divide-y divide-white/[0.055]" aria-live="polite">
          {visibleItems.map((item) => {
            const Icon = iconFor(item.type);
            const content = (
              <>
                <span className={`notification-icon notification-icon--${item.type}`}><Icon className="size-[18px]" /></span>
                <span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-3"><span className="text-sm font-semibold text-slate-200 transition-colors group-hover:text-white">{item.title}</span><span className="shrink-0 text-[9px] text-slate-700">{item.time}</span></span><span className="mt-1.5 block max-w-2xl text-xs leading-5 text-slate-500">{item.body}</span>{item.href && <span className="mt-3 inline-flex items-center gap-2 text-[10px] font-semibold text-emerald-400">Məzmunu aç <LinkLoadingIndicator /><span>→</span></span>}</span>
                {item.unread && <span className="mt-1 size-2 shrink-0 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,.6)]" />}
              </>
            );

            return item.href ? (
              <Link key={item.id} href={item.href} prefetch onClick={() => markRead(item.id)} className={`group flex gap-4 p-5 transition-all hover:bg-white/[0.022] sm:p-6 ${item.unread ? "bg-red-300/[0.018]" : ""}`}>{content}</Link>
            ) : (
              <button key={item.id} type="button" onClick={() => markRead(item.id)} className={`group flex w-full gap-4 p-5 text-left transition-all hover:bg-white/[0.022] sm:p-6 ${item.unread ? "bg-red-300/[0.018]" : ""}`}>{content}</button>
            );
          })}
          {visibleItems.length === 0 && <div className="grid min-h-60 place-items-center p-8 text-center"><div><CheckCheck className="mx-auto size-7 text-emerald-400" /><p className="mt-3 text-sm font-semibold text-slate-300">Burada hər şey təmizdir</p><p className="mt-1 text-xs text-slate-600">Bu filtrə uyğun bildiriş yoxdur.</p></div></div>}
        </div>
      </div>

      <aside className="space-y-5">
        <div className="rounded-2xl border border-red-300/10 bg-red-300/[0.035] p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-red-300/10 text-red-300"><BellRing className="size-5" /></span><div><p className="text-sm font-semibold text-white">{unreadCount} yeni siqnal</p><p className="mt-0.5 text-[10px] text-slate-600">Son 24 saat ərzində</p></div></div></div>
        <div className="rounded-2xl border border-red-300/10 bg-[#1a1d1f] p-5"><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-400">Bu həftə</p><div className="mt-4 space-y-4">{[{ icon: Flame, label: "Öyrənmə seriyası", value: "7 gün" },{ icon: Trophy, label: "Sinif sırası", value: "#4" },{ icon: ShieldAlert, label: "Həll edilən task", value: "8" }].map((stat)=>{const Icon=stat.icon;return <div key={stat.label} className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg border border-white/[0.06] bg-white/[0.025] text-slate-500"><Icon className="size-3.5" /></span><span className="flex-1 text-[11px] text-slate-500">{stat.label}</span><span className="font-mono text-xs font-semibold text-white">{stat.value}</span></div>})}</div></div>
      </aside>
    </div>
  );
}
