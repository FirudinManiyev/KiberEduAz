import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CircleDot,
  Crosshair,
  Flag,
  LockKeyhole,
  Map,
  Radar,
  ShieldCheck,
  Target,
} from "lucide-react";
import { LinkLoadingIndicator } from "@/components/feedback/link-loading-indicator";
import { ROADMAP_TRACKS } from "@/lib/content/roadmap";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "KiberEduAz Red Team, Blue Team və GRC öyrənmə yol xəritəsi.",
};

const TRACK_ICONS = {
  "red-team": Crosshair,
  "blue-team": Radar,
  grc: ShieldCheck,
} as const;

const phases = [
  { id: "01", label: "Təməl", title: "Kiber düşüncə", text: "Etika, terminologiya və risk anlayışları", status: "current" },
  { id: "02", label: "Praktika", title: "Analiz bacarığı", text: "Log, framework və hücum ssenariləri", status: "next" },
  { id: "03", label: "İxtisas", title: "Rol seçimi", text: "Red Team, Blue Team və ya GRC istiqaməti", status: "locked" },
  { id: "04", label: "Nailiyyət", title: "Yekun missiya", text: "Bilikləri birləşdirən kompleks ssenari", status: "locked" },
] as const;

export default function RoadmapPage() {
  return (
    <main className="flex-1">
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="hero-glow absolute inset-0 -z-10" />
        <div className="cyber-grid absolute inset-0 -z-10 opacity-[0.14]" />
        <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_420px] lg:items-center lg:px-10 lg:py-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.055] px-3 py-1.5 text-[11px] font-semibold text-emerald-200">
              <Map className="size-3.5" aria-hidden="true" />
              Şəxsi inkişaf xəritəsi
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.055em] text-white sm:text-5xl lg:text-[58px]">
              Üç istiqamət. <span className="text-gradient">Bir kiber gələcək.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
              Red Team, Blue Team və GRC xətlərində yeddi açıq Room-u addım-addım tamamla, sonra ixtisasını dərinləşdir.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {["7 açıq Room", "35 task", "4 300 XP", "3 ixtisas xətti"].map((item) => (
                <span key={item} className="rounded-full border border-white/[0.08] bg-black/20 px-3 py-1.5 text-[10px] font-semibold text-slate-300">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="roadmap-score-card group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black/25">
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image src="/images/computer_photo.png" alt="Öyrənmə roadmap-i üçün kompüter təsviri" fill priority sizes="(min-width: 1024px) 420px, 100vw" className="object-contain p-5 transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#151719] via-transparent to-transparent" />
            </div>
            <div className="relative flex items-center gap-4 p-5">
              <span className="grid size-12 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-300"><Target className="size-5" /></span>
              <div className="flex-1">
                <div className="flex justify-between text-[10px]"><span className="font-semibold uppercase tracking-wider text-slate-500">MVP kataloqu</span><span className="font-mono text-emerald-400">100%</span></div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full w-full rounded-full bg-gradient-to-r from-red-500 via-sky-400 to-emerald-400" /></div>
                <p className="mt-2 text-[10px] text-slate-600">Yeddi Room artıq öyrənmək üçün açıqdır</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <section aria-labelledby="tracks-heading">
          <div className="mb-7"><p className="section-kicker">İstiqamətlər</p><h2 id="tracks-heading" className="section-title">Öyrənmə xəttini seç</h2></div>
          <div className="grid gap-5 xl:grid-cols-3">
            {ROADMAP_TRACKS.map((track) => {
              const Icon = TRACK_ICONS[track.id];
              const tone = toneClasses(track.tone);
              return (
                <article key={track.id} className={`roadmap-track group relative min-w-0 overflow-hidden rounded-2xl border bg-[#1a1d1f] p-5 transition-all duration-500 hover:-translate-y-1 sm:p-6 ${tone.border}`}>
                  <div className={`card-radar ${track.tone === "green" ? "card-radar--green" : "card-radar--red"}`} />
                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <span className={`grid size-12 place-items-center rounded-2xl border ${tone.icon}`}><Icon className="size-5 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110" /></span>
                      <span className={`font-mono text-xs font-bold ${tone.text}`}>{track.stages.filter((stage) => stage.status === "available").length} açıq</span>
                    </div>
                    <p className={`mt-6 text-[10px] font-semibold uppercase tracking-[0.15em] ${tone.text}`}>{track.subtitle}</p>
                    <h3 className="mt-1 text-2xl font-semibold tracking-[-0.035em] text-white">{track.title}</h3>
                    <p className="mt-3 min-h-18 text-sm leading-6 text-slate-500">{track.description}</p>
                    <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/[0.055]"><div className={`h-full rounded-full ${tone.fill}`} style={{ width: `${track.progress}%` }} /></div>

                    <div className="mt-6 space-y-2.5">
                      {track.stages.map((stage) => stage.href ? (
                        <Link key={stage.title} href={stage.href} prefetch className="group/module flex min-w-0 items-center gap-3 rounded-xl border border-white/[0.07] bg-black/15 p-3.5 transition-all hover:translate-x-1 hover:border-white/[0.14] hover:bg-white/[0.035]">
                          <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${tone.icon}`}><CircleDot className="size-3.5" /></span>
                          <span className="min-w-0 flex-1"><span className="block text-xs font-semibold leading-5 text-slate-200">{stage.title}</span><span className="mt-0.5 block text-[9px] text-slate-600">{stage.meta}</span></span>
                          <LinkLoadingIndicator /><ArrowRight className="size-3.5 shrink-0 text-slate-700 transition-all group-hover/module:translate-x-1 group-hover/module:text-white" />
                        </Link>
                      ) : (
                        <div key={stage.title} className="flex min-w-0 items-center gap-3 rounded-xl border border-dashed border-white/[0.06] p-3.5 opacity-55">
                          <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/[0.07] text-slate-700"><LockKeyhole className="size-3.5" /></span>
                          <span className="min-w-0 flex-1"><span className="block text-xs font-medium leading-5 text-slate-500">{stage.title}</span><span className="mt-0.5 block text-[9px] text-slate-700">{stage.meta}</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="pt-16" aria-labelledby="phases-heading">
          <div className="mb-7"><p className="section-kicker section-kicker--red">Uzunmüddətli inkişaf</p><h2 id="phases-heading" className="section-title">Bacarığın 4 mərhələsi</h2></div>
          <div className="relative grid gap-4 md:grid-cols-4">
            <div className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-px bg-gradient-to-r from-emerald-400/40 via-red-400/25 to-white/[0.06] md:block" />
            {phases.map((phase) => (
              <article key={phase.id} className={`phase-card group relative rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 ${phase.status === "current" ? "border-emerald-300/20 bg-emerald-300/[0.045]" : "border-red-300/10 bg-[#191b1d]"}`}>
                <span className={`relative z-10 grid size-14 place-items-center rounded-2xl border font-mono text-sm font-bold transition-transform duration-500 group-hover:-rotate-4 group-hover:scale-105 ${phase.status === "current" ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-300" : phase.status === "next" ? "border-red-300/20 bg-red-300/[0.07] text-red-300" : "border-white/[0.07] text-slate-700"}`}>{phase.status === "current" ? <Check className="size-5" /> : phase.id}</span>
                <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-600">{phase.label}</p><h3 className="mt-1 text-sm font-semibold text-slate-200">{phase.title}</h3><p className="mt-2 text-[11px] leading-5 text-slate-600">{phase.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="pt-16">
          <div className="achievement-banner group relative overflow-hidden rounded-2xl border border-emerald-300/10 p-6 sm:p-8">
            <div className="cyber-grid absolute inset-0 opacity-[0.12]" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-red-300/20 bg-red-300/10 text-red-300 transition-transform group-hover:rotate-6"><Flag className="size-5" /></span><div><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-red-400">İlk hədəf</p><h2 className="mt-1 text-xl font-semibold text-white">Maraqlandığın xəttin ilk Room-unu bitir</h2><p className="mt-2 text-sm text-slate-500">Yeddi dərsdən birini seç və ilk XP-ni qazan.</p></div></div>
              <Link href="/rooms" prefetch className="primary-action shrink-0">Room-ları aç <LinkLoadingIndicator /><ArrowRight className="size-4" /><span className="button-sheen" /></Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function toneClasses(tone: "red" | "blue" | "green") {
  if (tone === "red") return { border: "border-red-300/15 hover:border-red-300/32", icon: "border-red-300/20 bg-red-300/10 text-red-300", text: "text-red-300", fill: "bg-gradient-to-r from-red-800 to-red-400" };
  if (tone === "blue") return { border: "border-sky-300/15 hover:border-sky-300/32", icon: "border-sky-300/20 bg-sky-300/10 text-sky-300", text: "text-sky-300", fill: "bg-gradient-to-r from-sky-800 to-sky-400" };
  return { border: "border-emerald-300/12 hover:border-emerald-300/30", icon: "border-emerald-300/20 bg-emerald-300/10 text-emerald-300", text: "text-emerald-300", fill: "bg-gradient-to-r from-emerald-800 to-emerald-400" };
}

