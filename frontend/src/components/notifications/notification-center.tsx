"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, BellRing, BookOpen, CheckCheck, Flame, Info, Loader2, ShieldAlert, Trophy } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { LinkLoadingIndicator } from "@/components/feedback/link-loading-indicator";
import { apiRequest } from "@/lib/api/client";
import { toUserErrorMessage } from "@/lib/errors/user-error";
import type { NotificationFeed, ProgressSummary } from "@/lib/api/types";

type NotificationCenterProps = {
  feed: NotificationFeed;
  summary: ProgressSummary;
  classRank: number | null;
};

const filters = [
  { key: "all", label: "Hamısı" },
  { key: "unread", label: "Oxunmamış" },
  { key: "TRAINING", label: "Təlim" },
  { key: "ACHIEVEMENT", label: "Nailiyyət" },
] as const;

const ICONS = { TRAINING: BookOpen, ACHIEVEMENT: Award, SYSTEM: Info } as const;
const ICON_TONES = { TRAINING: "training", ACHIEVEMENT: "achievement", SYSTEM: "system" } as const;

export function NotificationCenter({ feed, summary, classRank }: NotificationCenterProps) {
  const router = useRouter();
  const [state, setState] = useState(feed);
  const [filter, setFilter] = useState<(typeof filters)[number]["key"]>("all");
  const [markingAll, setMarkingAll] = useState(false);
  const [pending, startTransition] = useTransition();

  const visibleItems = useMemo(
    () =>
      state.items.filter((item) =>
        filter === "all" ? true : filter === "unread" ? item.unread : item.type === filter,
      ),
    [filter, state.items],
  );

  async function markAllRead() {
    setMarkingAll(true);
    toast.loading("Bildirişlər yenilənir…", { id: "notifications-read-all" });

    try {
      const next = await apiRequest<NotificationFeed>("/notifications/read-all", { method: "POST" });
      setState(next);
      toast.success("Bütün bildirişlər oxunmuş kimi qeyd edildi", {
        id: "notifications-read-all",
      });
      startTransition(() => router.refresh());
    } catch (cause) {
      toast.error(toUserErrorMessage(cause, "Bildirişlər yenilənə bilmədi"), {
        id: "notifications-read-all",
      });
    } finally {
      setMarkingAll(false);
    }
  }

  async function markRead(id: string) {
    if (!state.items.find((item) => item.id === id)?.unread) return;

    // Update optimistically so navigating away from a link still feels instant.
    setState((current) => ({
      unreadCount: Math.max(0, current.unreadCount - 1),
      items: current.items.map((item) => (item.id === id ? { ...item, unread: false } : item)),
    }));

    try {
      await apiRequest<NotificationFeed>(`/notifications/${id}/read`, { method: "POST" });
      startTransition(() => router.refresh());
    } catch (cause) {
      setState(feed);
      toast.error(toUserErrorMessage(cause, "Bildiriş oxunmuş kimi qeyd edilə bilmədi"));
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="overflow-hidden rounded-2xl border border-red-300/10 bg-[#1a1d1f]">
        <div className="flex flex-col gap-4 border-b border-white/[0.065] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex gap-1 overflow-x-auto rounded-xl bg-black/25 p-1">
            {filters.map((item) => (
              <button key={item.key} type="button" onClick={() => setFilter(item.key)} className={`shrink-0 rounded-lg px-3 py-2 text-[11px] font-semibold transition-all ${filter === item.key ? "bg-white/[0.09] text-white shadow" : "text-slate-600 hover:text-slate-300"}`}>{item.label}{item.key === "unread" && state.unreadCount > 0 && <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[8px] text-white">{state.unreadCount}</span>}</button>
            ))}
          </div>
          <button type="button" onClick={markAllRead} disabled={state.unreadCount === 0 || pending || markingAll} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.07] px-3 py-2 text-[11px] font-semibold text-slate-500 transition-all hover:border-emerald-300/20 hover:bg-emerald-300/[0.05] hover:text-emerald-300 disabled:opacity-35">{pending || markingAll ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCheck className="size-3.5" />}Hamısını oxunmuş et</button>
        </div>

        <div className="divide-y divide-white/[0.055]" aria-live="polite">
          {visibleItems.map((item) => {
            const Icon = ICONS[item.type];
            const content = (
              <>
                <span className={`notification-icon notification-icon--${ICON_TONES[item.type]}`}><Icon className="size-[18px]" /></span>
                <span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-3"><span className="text-sm font-semibold text-slate-200 transition-colors group-hover:text-white">{item.title}</span><span className="shrink-0 text-[9px] text-slate-700">{formatRelative(item.createdAt)}</span></span><span className="mt-1.5 block max-w-2xl text-xs leading-5 text-slate-500">{item.body}</span>{item.href && <span className="mt-3 inline-flex items-center gap-2 text-[10px] font-semibold text-emerald-400">Məzmunu aç <LinkLoadingIndicator /><span>→</span></span>}</span>
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
        <div className="rounded-2xl border border-red-300/10 bg-red-300/[0.035] p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-red-300/10 text-red-300"><BellRing className="size-5" /></span><div><p className="text-sm font-semibold text-white">{state.unreadCount} yeni siqnal</p><p className="mt-0.5 text-[10px] text-slate-600">Oxunmamış bildiriş</p></div></div></div>
        <div className="rounded-2xl border border-red-300/10 bg-[#1a1d1f] p-5"><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-400">Cari vəziyyət</p><div className="mt-4 space-y-4">{[
          { icon: Flame, label: "Öyrənmə seriyası", value: `${summary.currentStreak} gün` },
          { icon: Trophy, label: "Sinif sırası", value: classRank ? `#${classRank}` : "—" },
          { icon: ShieldAlert, label: "Həll edilən task", value: String(summary.tasksCompleted) },
        ].map((stat)=>{const Icon=stat.icon;return <div key={stat.label} className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg border border-white/[0.06] bg-white/[0.025] text-slate-500"><Icon className="size-3.5" /></span><span className="flex-1 text-[11px] text-slate-500">{stat.label}</span><span className="font-mono text-xs font-semibold text-white">{stat.value}</span></div>})}</div></div>
      </aside>
    </div>
  );
}

function formatRelative(iso: string): string {
  const diffMinutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);

  if (diffMinutes < 1) return "indicə";
  if (diffMinutes < 60) return `${diffMinutes} dəq əvvəl`;

  const hours = Math.round(diffMinutes / 60);
  if (hours < 24) return `${hours} saat əvvəl`;

  const days = Math.round(hours / 24);
  if (days === 1) return "dünən";
  if (days < 30) return `${days} gün əvvəl`;

  return new Date(iso).toLocaleDateString("az-AZ", { day: "numeric", month: "short" });
}
