import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Award,
  Bell,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Flame,
  Gauge,
  Map,
  Radar,
  ShieldCheck,
  Target,
  Trophy,
  UserRound,
  Zap,
} from "lucide-react";
import { LinkLoadingIndicator } from "@/components/feedback/link-loading-indicator";
import { CyberHeroShell } from "@/components/hero/cyber-hero-shell";
import { CommandConsole } from "@/components/home/command-console";
import { ProgressiveRoomRoadmap } from "@/components/home/progressive-room-roadmap";
import { RoomCard } from "@/components/room/room-card";
import { apiFetch, apiFetchOrNull } from "@/lib/api/server";
import type {
  Leaderboard,
  MyProfile,
  NotificationFeed,
  ProgressSummary,
  RoomSummary,
} from "@/lib/api/types";
import { homePathFor } from "@/lib/auth/home-path";

const AVATAR_TONES = ["emerald", "red", "violet", "dark"] as const;

export const metadata: Metadata = {
  title: "İdarə paneli",
  description:
    "Xalların, seriyan, sinif reytinqin və davam edən Room-ların bir ekranda toplandığı şəxsi idarə paneli.",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const profile = await apiFetchOrNull<MyProfile>("/profiles/me");

  if (!profile) redirect("/login?next=/dashboard");

  const home = homePathFor(profile);

  if (home !== "/dashboard") redirect(home);

  const [rooms, summary, leaderboard, notifications] = await Promise.all([
    apiFetch<RoomSummary[]>("/rooms"),
    apiFetch<ProgressSummary>("/progress/summary"),
    apiFetchOrNull<Leaderboard>("/leaderboard?limit=4"),
    apiFetchOrNull<NotificationFeed>("/notifications"),
  ]);

  const continueRoom = rooms.find((room) => room.progress.status === "IN_PROGRESS") ?? rooms[0];
  const totalTasks = rooms.reduce((sum, room) => sum + room.taskCount, 0);
  const availablePoints = rooms.reduce((sum, room) => sum + room.points, 0);

  const stats = [
    {
      label: "Toplanan xal",
      value: summary.totalPoints.toLocaleString("az-AZ"),
      delta: summary.rank.name,
      icon: Zap,
      tone: "green",
      fill: summary.rank.percent,
    },
    {
      label: "Task dəqiqliyi",
      value: `${summary.accuracy}%`,
      delta: `${summary.tasksCompleted} task`,
      icon: Target,
      tone: "red",
      fill: summary.accuracy,
    },
    {
      label: "Aktiv seriya",
      value: `${summary.currentStreak} gün`,
      delta: `rekord ${summary.longestStreak}`,
      icon: Flame,
      tone: "amber",
      fill: Math.min(100, summary.currentStreak * 10),
    },
    {
      label: leaderboard ? `${leaderboard.scope.label} sırası` : "Tamamlanan Room",
      value: leaderboard?.currentUser ? `#${leaderboard.currentUser.rank}` : String(summary.roomsCompleted),
      delta: leaderboard ? `${leaderboard.total} nəfər` : `${summary.totalPublishedRooms} Room`,
      icon: Trophy,
      tone: "green",
      fill: summary.totalPublishedRooms
        ? Math.round((summary.roomsCompleted / summary.totalPublishedRooms) * 100)
        : 0,
    },
  ];

  const quickLinks = [
    { href: "/roadmap", label: "Roadmap", text: "Növbəti bacarıq mərhələni gör", icon: Map, tone: "green" },
    {
      href: "/notifications",
      label: "Bildirişlər",
      text: notifications?.unreadCount
        ? `${notifications.unreadCount} yeni yeniləmən var`
        : "Yeni bildiriş yoxdur",
      icon: Bell,
      tone: "red",
    },
    { href: "/profile", label: "Profil", text: "Hədəflərini və profilini yenilə", icon: UserRound, tone: "neutral" },
  ];

  const pointsToPodium = leaderboard?.currentUser
    ? Math.max(0, (leaderboard.entries[2]?.points ?? 0) - leaderboard.currentUser.points)
    : 0;

  return (
    <main className="flex-1 overflow-hidden">
      <div className="threat-ticker border-b border-white/[0.055] bg-black/30">
        <div className="threat-ticker__track">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center gap-10 pr-10">
              <span><i className="bg-red-400" /> AKTİV SERİYA: {summary.currentStreak} GÜN</span>
              <span><i className="bg-emerald-400" /> {summary.totalPublishedRooms} ROOM DƏRC OLUNUB</span>
              <span><i className="bg-red-400" /> RÜTBƏN: {summary.rank.name.toLocaleUpperCase("az")}</span>
            </div>
          ))}
        </div>
      </div>

      <CyberHeroShell ariaLabelledby="student-hero-heading">
        <div className="mx-auto grid min-h-[inherit] max-w-[1440px] gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:px-10 lg:py-20">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-300/15 bg-red-300/[0.055] px-3 py-1.5 text-[11px] font-semibold text-red-200 shadow-[0_0_30px_rgba(239,68,68,.06)]">
              <Radar className="size-3.5 animate-pulse" aria-hidden="true" />
              Təhlükəni görməyi öyrən
            </div>
            <h1 id="student-hero-heading" className="text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.06em] text-white drop-shadow-[0_8px_28px_rgba(0,0,0,.45)] sm:text-5xl lg:text-[67px]">
              Kiber dünyanı<br />
              <span className="text-gradient">missiyalarla fəth et.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
              Oxu, real ssenarini analiz et, cavabını yoxla və xal qazan. KiberEduAz məktəb və kollec tələbələri üçün qurulmuş təhlükəsiz praktika mərkəzidir.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={continueRoom ? `/rooms/${continueRoom.slug}` : "/rooms"} prefetch className="primary-action group">
                <span className="relative z-10">Missiyaya davam et</span>
                <span className="relative z-10 flex items-center gap-2"><LinkLoadingIndicator /><ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
                <span className="button-sheen" />
              </Link>
              <Link href="/roadmap" prefetch className="secondary-action group">
                Təlim xəritəsini aç
                <span className="flex items-center gap-2"><LinkLoadingIndicator /><ChevronRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
              </Link>
            </div>

            <div className="mt-9 grid max-w-xl grid-cols-3 gap-2 sm:gap-3">
              {[
                { value: String(rooms.length).padStart(2, "0"), label: "Mövcud Room", icon: BookOpenCheck },
                { value: String(totalTasks), label: "Praktiki task", icon: CheckCircle2 },
                { value: availablePoints.toLocaleString("az-AZ"), label: "Mümkün XP", icon: Award },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="hero-mini-stat group bg-black/30 backdrop-blur-md">
                    <Icon className="size-4 text-emerald-400 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />
                    <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
                    <p className="mt-0.5 text-[10px] text-slate-600">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="cyber-hero-console relative mx-auto w-full max-w-[610px] lg:mr-0">
            <div className="absolute -inset-12 -z-10 rounded-full bg-red-500/[0.045] blur-3xl" />
            <CommandConsole />
          </div>
        </div>
      </CyberHeroShell>

      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <section aria-labelledby="overview-heading">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-kicker">İrəliləyiş göstəriciləri</p>
              <h2 id="overview-heading" className="section-title">Komanda mərkəzin</h2>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-600"><Activity className="size-3.5 text-emerald-400" /><span>İndi yeniləndi</span></div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <article key={stat.label} className="metric-card group">
                  <div className="metric-card__noise" />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{stat.value}</p>
                    </div>
                    <span className={`stat-icon stat-icon--${stat.tone}`}><Icon className="size-[18px]" /></span>
                  </div>
                  <div className="relative mt-5">
                    <div className="flex items-center justify-between text-[10px]"><span className="font-medium text-emerald-400">{stat.delta}</span><span className="text-slate-700">cari</span></div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.055]"><div className={`metric-fill metric-fill--${stat.tone}`} style={{ width: `${Math.min(100, Math.max(0, stat.fill))}%` }} /></div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="pt-8" aria-label="Sürətli keçidlər">
          <div className="grid gap-3 md:grid-cols-3">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} prefetch className={`quick-link quick-link--${item.tone} group`}>
                  <span className="quick-link__icon"><Icon className="size-5 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110" /></span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-100">{item.label}</span><span className="mt-1 block truncate text-[11px] text-slate-600">{item.text}</span></span>
                  <span className="flex items-center gap-2"><LinkLoadingIndicator /><ArrowRight className="size-4 text-slate-600 transition-all group-hover:translate-x-1 group-hover:text-white" /></span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="pt-16" aria-labelledby="rooms-heading">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div><p className="section-kicker">Aktiv missiyalar</p><h2 id="rooms-heading" className="section-title">Room-larını davam etdir</h2></div>
            <Link href="/rooms" prefetch className="group hidden items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-emerald-300 sm:flex">Hamısına bax <LinkLoadingIndicator /><ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link>
          </div>
          {rooms.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">{rooms.slice(0, 4).map((room) => <RoomCard key={room.slug} room={room} featured />)}</div>
          ) : (
            <p className="rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.015] p-8 text-center text-sm text-slate-500">
              Hələ dərc olunmuş Room yoxdur. Müəllim məzmun əlavə etdikdən sonra burada görünəcək.
            </p>
          )}
        </section>

        <section className="pt-16" aria-labelledby="progress-heading">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
            <div className="overflow-hidden rounded-2xl border border-red-300/10 bg-[#1a1d1f]">
              <div className="flex items-center justify-between border-b border-white/[0.065] px-5 py-5 sm:px-6">
                <div><p className="section-kicker">Təlim yolu</p><h2 id="progress-heading" className="mt-1 text-xl font-semibold tracking-[-0.03em] text-white">Kiber başlanğıc</h2></div>
                <Link href="/roadmap" prefetch className="grid size-10 place-items-center rounded-xl border border-white/[0.08] text-slate-500 transition-all hover:rotate-3 hover:border-emerald-300/20 hover:bg-emerald-300/[0.06] hover:text-emerald-300" aria-label="Roadmap-a keç"><Map className="size-4" /></Link>
              </div>
              <div className="relative p-5 sm:p-7">
                <div className="road-line absolute bottom-[69px] left-12 top-[65px] w-px sm:left-[53px]" />
                <div className="space-y-4">
                  <ProgressiveRoomRoadmap rooms={rooms} />
                  <div className="relative flex items-center gap-4 rounded-xl border border-dashed border-white/[0.07] p-4 opacity-60">
                    <span className="relative z-10 grid size-11 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-[#1a1d1f] text-slate-600"><CircleDot className="size-4" /></span>
                    <span><span className="block text-[10px] uppercase tracking-[0.13em] text-slate-700">Növbəti mərhələ</span><span className="mt-1 block text-sm font-medium text-slate-500">Şəbəkə müdafiəsi · tezliklə</span></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-red-300/10 bg-[#1a1d1f]">
              <div className="flex items-center justify-between border-b border-white/[0.065] px-5 py-5 sm:px-6">
                <div><p className="section-kicker section-kicker--red">{leaderboard?.scope.label ?? "Reytinq"}</p><h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-white">Həftəlik reytinq</h2></div>
                <Trophy className="size-5 text-red-400" />
              </div>
              <div className="divide-y divide-white/[0.055]">
                {leaderboard?.entries.length ? (
                  leaderboard.entries.map((person, index) => (
                    <div key={person.id} className={`leader-row flex items-center gap-3 px-5 py-4 sm:px-6 ${person.isCurrentUser ? "bg-emerald-300/[0.045]" : ""}`}>
                      <span className={`w-5 text-center text-sm font-bold ${person.rank <= 3 ? "text-red-300" : "text-slate-600"}`}>{person.rank}</span>
                      <span className={`avatar avatar--${AVATAR_TONES[index % AVATAR_TONES.length]}`}>{person.initials}</span>
                      <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-200">{person.name} {person.isCurrentUser && <span className="ml-1 text-[9px] font-medium text-emerald-400">SƏN</span>}</p><p className="mt-0.5 text-[10px] text-slate-600">{person.roomsCompleted} Room tamamlanıb</p></div>
                      <span className="font-mono text-[11px] font-semibold text-slate-400">{person.points.toLocaleString("az-AZ")} XP</span>
                    </div>
                  ))
                ) : (
                  <p className="px-5 py-8 text-center text-xs text-slate-600 sm:px-6">Reytinq üçün hələ kifayət qədər məlumat yoxdur.</p>
                )}
              </div>
              {pointsToPodium > 0 && (
                <div className="border-t border-white/[0.06] p-4"><div className="flex items-center gap-3 rounded-xl border border-red-300/10 bg-red-300/[0.04] p-3"><Gauge className="size-4 text-red-400" /><p className="flex-1 text-[11px] text-slate-500">3-cü yerə çatmaq üçün <span className="font-semibold text-slate-300">{pointsToPodium.toLocaleString("az-AZ")} XP</span> lazımdır.</p></div></div>
              )}
            </div>
          </div>
        </section>

        {continueRoom && (
          <section className="pt-16">
            <div className="achievement-banner group relative overflow-hidden rounded-2xl border border-emerald-300/10 p-6 sm:p-8">
              <div className="cyber-grid absolute inset-0 opacity-[0.12]" />
              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-300 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"><ShieldCheck className="size-6" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-400">Növbəti nailiyyət</p><h2 className="mt-1 text-xl font-semibold text-white">{continueRoom.title}</h2><p className="mt-2 text-sm text-slate-500">{continueRoom.progress.percent}% tamamlanıb · {continueRoom.points} XP mükafat.</p></div></div>
                <Link href={`/rooms/${continueRoom.slug}`} prefetch className="secondary-action group/link shrink-0">Davam et <span className="flex items-center gap-2"><LinkLoadingIndicator /><ArrowRight className="size-4 transition-transform group-hover/link:translate-x-1" /></span></Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
