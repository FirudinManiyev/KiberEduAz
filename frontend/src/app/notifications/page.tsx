import type { Metadata } from "next";
import { BellRing } from "lucide-react";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { apiFetch, apiFetchOrNull } from "@/lib/api/server";
import type { Leaderboard, NotificationFeed, ProgressSummary } from "@/lib/api/types";

export const metadata: Metadata = { title: "Bildirişlər", description: "KiberEduAz təlim, nailiyyət və sistem bildirişləri." };

export default async function NotificationsPage() {
  const [feed, summary, leaderboard] = await Promise.all([
    apiFetch<NotificationFeed>("/notifications"),
    apiFetch<ProgressSummary>("/progress/summary"),
    apiFetchOrNull<Leaderboard>("/leaderboard?limit=1"),
  ]);

  return (
    <main className="flex-1"><section className="relative overflow-hidden border-b border-white/[0.06]"><div className="room-glow-red absolute inset-0 -z-10" /><div className="cyber-grid absolute inset-0 -z-10 opacity-[0.12]" /><div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14"><div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-red-300/20 bg-red-300/10 text-red-300"><BellRing className="size-6" /></span><div><p className="section-kicker section-kicker--red">Siqnal mərkəzi</p><h1 className="mt-1 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">Bildirişlər</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">Təlim, nailiyyət və sistem yeniliklərini bir yerdən izlə.</p></div></div></div></section><section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14"><NotificationCenter feed={feed} summary={summary} classRank={leaderboard?.currentUser?.rank ?? null} /></section></main>
  );
}
