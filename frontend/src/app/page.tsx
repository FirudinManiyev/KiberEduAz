import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Flame,
  GraduationCap,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Target,
  Terminal,
  Trophy,
  Zap,
} from "lucide-react";
import { RoomCard } from "@/components/room/room-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { rooms } from "@/data/rooms";

const stats = [
  {
    label: "Toplanan xal",
    value: "1,240",
    note: "+240 bu həftə",
    icon: Zap,
    tone: "green",
  },
  {
    label: "Tamamlanan task",
    value: "8 / 10",
    note: "80% irəliləyiş",
    icon: CheckCircle2,
    tone: "blue",
  },
  {
    label: "Öyrənmə seriyası",
    value: "7 gün",
    note: "Şəxsi rekord: 12",
    icon: Flame,
    tone: "amber",
  },
  {
    label: "Sinif sıralaması",
    value: "#4",
    note: "24 şagird arasında",
    icon: Trophy,
    tone: "violet",
  },
];

const leaderboard = [
  { rank: 1, name: "Murad Ə.", points: 2840, initials: "MƏ", tone: "emerald" },
  { rank: 2, name: "Ləman H.", points: 2610, initials: "LH", tone: "sky" },
  { rank: 3, name: "Tural M.", points: 2380, initials: "TM", tone: "violet" },
  { rank: 4, name: "Aylin N.", points: 1240, initials: "AN", tone: "cyan", current: true },
];

export default function Home() {
  const activeRoom = rooms[0];

  return (
    <main className="flex-1 overflow-hidden">
      <section className="relative border-b border-white/[0.06]">
        <div className="hero-glow absolute inset-0 -z-10" />
        <div className="cyber-grid absolute inset-0 -z-10 opacity-[0.16]" />
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-10 lg:py-20">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-3 py-1.5 text-xs font-semibold text-emerald-200">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Kiber bacarıqların üçün missiya mərkəzi
            </div>
            <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.055em] text-white sm:text-5xl lg:text-[64px]">
              Öyrən. Sına. <span className="text-gradient">Müdafiə et.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
              Kibertəhlükəsizliyi quru nəzəriyyə ilə deyil, real ssenarilər və addım-addım tasklarla öyrən. Hər cavab səni növbəti səviyyəyə aparır.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/rooms/${activeRoom.slug}`}
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 text-sm font-bold text-[#06100c] shadow-[0_10px_35px_rgba(52,211,153,0.18)] transition-all hover:-translate-y-0.5 hover:bg-emerald-300 hover:shadow-[0_14px_42px_rgba(52,211,153,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070a0d]"
              >
                Room-a davam et
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link
                href="/rooms"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.035] px-5 text-sm font-semibold text-white transition-all hover:border-white/[0.2] hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Bütün Room-lar
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-400" aria-hidden="true" />
                Təhlükəsiz ssenarilər
              </span>
              <span className="inline-flex items-center gap-2">
                <BookOpenCheck className="size-4 text-sky-400" aria-hidden="true" />
                Nəzəriyyə + praktika
              </span>
              <span className="inline-flex items-center gap-2">
                <Award className="size-4 text-violet-400" aria-hidden="true" />
                Xal və nailiyyətlər
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[590px] lg:mr-0">
            <div className="absolute -inset-10 -z-10 rounded-full bg-emerald-400/[0.04] blur-3xl" />
            <div className="overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0a0f13]/90 shadow-[0_30px_100px_rgba(0,0,0,.35)] backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/[0.07] bg-white/[0.025] px-4 py-3">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="size-2.5 rounded-full bg-rose-400/70" />
                  <span className="size-2.5 rounded-full bg-amber-300/70" />
                  <span className="size-2.5 rounded-full bg-emerald-300/70" />
                </div>
                <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
                  <Terminal className="size-3.5" aria-hidden="true" />
                  learning_session.exe
                </div>
              </div>

              <div className="relative p-5 sm:p-7">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[11px] text-emerald-400">$ current_mission</p>
                    <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">{activeRoom.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">Task 2 · Oxşar anlayışlar</p>
                  </div>
                  <ProgressRing value={activeRoom.progress} size={58} />
                </div>

                <div className="space-y-2.5">
                  {[
                    { label: "Pentestinq nədir?", status: "done" },
                    { label: "Oxşar anlayışlar", status: "active" },
                    { label: "Black, White və Grey Box", status: "next" },
                    { label: "Metodologiya", status: "locked" },
                  ].map((task, index) => (
                    <div
                      key={task.label}
                      className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors ${
                        task.status === "active"
                          ? "border-emerald-300/20 bg-emerald-300/[0.07]"
                          : "border-white/[0.055] bg-white/[0.018]"
                      }`}
                    >
                      <span
                        className={`grid size-7 shrink-0 place-items-center rounded-lg text-[11px] font-bold ${
                          task.status === "done"
                            ? "bg-emerald-400 text-emerald-950"
                            : task.status === "active"
                              ? "border border-emerald-300/25 bg-emerald-300/10 text-emerald-300"
                              : "border border-white/[0.08] bg-white/[0.03] text-slate-500"
                        }`}
                      >
                        {task.status === "done" ? (
                          <CheckCircle2 className="size-4" aria-hidden="true" />
                        ) : task.status === "locked" ? (
                          <LockKeyhole className="size-3.5" aria-hidden="true" />
                        ) : (
                          String(index + 1).padStart(2, "0")
                        )}
                      </span>
                      <span className={`flex-1 text-sm ${task.status === "active" ? "font-medium text-slate-100" : "text-slate-400"}`}>
                        {task.label}
                      </span>
                      {task.status === "active" && (
                        <span className="size-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between rounded-xl border border-sky-300/10 bg-sky-300/[0.045] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 place-items-center rounded-lg bg-sky-300/10 text-sky-300">
                      <Target className="size-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">Növbəti mükafat</p>
                      <p className="text-[11px] text-slate-500">Taskı bitir · +100 XP</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-sky-300">100 XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <section aria-labelledby="overview-heading">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-kicker">Sənin vəziyyətin</p>
              <h2 id="overview-heading" className="section-title">Bu həftənin icmalı</h2>
            </div>
            <p className="text-sm text-slate-500">Son yenilənmə: bu gün, 14:20</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <article key={stat.label} className="group rounded-2xl border border-white/[0.07] bg-[#0c1116] p-5 transition-all duration-300 hover:border-white/[0.13] hover:bg-[#0f151b]">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{stat.value}</p>
                    </div>
                    <span className={`stat-icon stat-icon--${stat.tone}`}>
                      <Icon className="size-[18px]" aria-hidden="true" />
                    </span>
                  </div>
                  <p className="mt-4 text-[11px] font-medium text-slate-500">{stat.note}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="pt-16" aria-labelledby="rooms-heading">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="section-kicker">Aktiv təlimlər</p>
              <h2 id="rooms-heading" className="section-title">Room-larını davam etdir</h2>
            </div>
            <Link href="/rooms" className="group hidden items-center gap-1.5 text-sm font-semibold text-slate-400 transition-colors hover:text-emerald-300 sm:flex">
              Hamısına bax
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {rooms.map((room) => (
              <RoomCard key={room.slug} room={room} featured />
            ))}
          </div>
        </section>

        <section id="learning-path" className="scroll-mt-28 pt-16" aria-labelledby="path-heading">
          <div className="mb-7">
            <p className="section-kicker">Strukturlaşdırılmış inkişaf</p>
            <h2 id="path-heading" className="section-title">Sənin təlim xəritən</h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0b1015]">
            <div className="grid lg:grid-cols-[300px_1fr]">
              <div className="relative overflow-hidden border-b border-white/[0.07] p-6 sm:p-8 lg:border-r lg:border-b-0">
                <div className="cyber-grid absolute inset-0 opacity-[0.14]" />
                <div className="relative">
                  <div className="grid size-12 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-300">
                    <GraduationCap className="size-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-white">Kiber başlanğıc</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Texniki və idarəetmə təməlini paralel qur.</p>
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Ümumi progress</span>
                      <span className="font-semibold text-emerald-300">16%</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full w-[16%] rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-8">
                <div className="relative grid gap-4 md:grid-cols-2">
                  <div className="path-line absolute left-[calc(25%-2px)] right-[calc(25%-2px)] top-7 hidden h-px md:block" />
                  {rooms.map((room, index) => (
                    <Link
                      key={room.slug}
                      href={`/rooms/${room.slug}`}
                      className="group relative rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition-all hover:-translate-y-0.5 hover:border-white/[0.14] hover:bg-white/[0.04]"
                    >
                      <div className="relative z-10 flex items-center justify-between">
                        <span className={`grid size-14 place-items-center rounded-2xl border text-sm font-bold ${room.accent === "green" ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-300" : "border-sky-300/25 bg-sky-300/10 text-sky-300"}`}>
                          0{index + 1}
                        </span>
                        <span className="rounded-full border border-white/[0.07] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          {room.progress > 0 ? "Davam edir" : "Hazırdır"}
                        </span>
                      </div>
                      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{room.module}</p>
                      <h4 className="mt-1 text-base font-semibold text-slate-100 transition-colors group-hover:text-white">{room.title}</h4>
                      <div className="mt-4 flex items-center justify-between border-t border-white/[0.055] pt-4 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5" />{room.duration}</span>
                        <span className={room.accent === "green" ? "text-emerald-300" : "text-sky-300"}>{room.points} XP</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="leaderboard" className="scroll-mt-28 pt-16" aria-labelledby="leaderboard-heading">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0c1116]">
              <div className="flex items-center justify-between border-b border-white/[0.065] px-5 py-5 sm:px-6">
                <div>
                  <p className="section-kicker">11A sinfi</p>
                  <h2 id="leaderboard-heading" className="mt-1 text-xl font-semibold tracking-[-0.03em] text-white">Həftəlik reytinq</h2>
                </div>
                <Trophy className="size-5 text-amber-300" aria-hidden="true" />
              </div>
              <div className="divide-y divide-white/[0.055]">
                {leaderboard.map((person) => (
                  <div key={person.rank} className={`flex items-center gap-4 px-5 py-4 sm:px-6 ${person.current ? "bg-emerald-300/[0.045]" : "hover:bg-white/[0.02]"}`}>
                    <span className={`w-5 text-center text-sm font-bold ${person.rank <= 3 ? "text-amber-300" : "text-slate-500"}`}>{person.rank}</span>
                    <span className={`avatar avatar--${person.tone}`}>{person.initials}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-200">{person.name} {person.current && <span className="ml-1 text-[10px] font-medium text-emerald-400">Sən</span>}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">Kiber başlanğıc yolu</p>
                    </div>
                    <span className="font-mono text-xs font-semibold text-slate-300">{person.points.toLocaleString("az-AZ")} XP</span>
                  </div>
                ))}
              </div>
            </div>

            <aside className="relative overflow-hidden rounded-2xl border border-violet-300/10 bg-[#0d1118] p-6">
              <div className="absolute -right-16 -top-16 size-44 rounded-full bg-violet-500/10 blur-3xl" />
              <div className="relative">
                <span className="grid size-12 place-items-center rounded-2xl border border-violet-300/20 bg-violet-300/10 text-violet-300">
                  <Award className="size-6" aria-hidden="true" />
                </span>
                <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-300">Növbəti rütbə</p>
                <h3 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-white">Bacarıqlı</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">Daha 760 XP topla və yeni rütbəni aç.</p>
                <div className="mt-6">
                  <div className="flex justify-between text-xs text-slate-500"><span>1,240 XP</span><span>2,000 XP</span></div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full w-[62%] rounded-full bg-gradient-to-r from-violet-500 to-sky-400" /></div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
