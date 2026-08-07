import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CircleDot,
  Crosshair,
  Flag,
  LockKeyhole,
  Map,
  ShieldCheck,
  Target,
} from "lucide-react";
import { LinkLoadingIndicator } from "@/components/feedback/link-loading-indicator";

export const metadata: Metadata = { title: "Roadmap", description: "KiberEduAz kiber bacarıq və təlim yol xəritəsi." };

const tracks = [
  {
    title: "Hücum təhlükəsizliyi",
    subtitle: "Red Team təməli",
    description: "Etik və hüquqi çərçivədə sistemlərə hücumçu baxışı ilə yanaşmağı öyrən.",
    icon: Crosshair,
    tone: "red",
    progress: 32,
    modules: [
      { title: "Pentestinqə giriş", meta: "5 task · 500 XP", status: "active", href: "/rooms/intro-to-pentesting" },
      { title: "Şəbəkə kəşfiyyatı", meta: "Tezliklə", status: "locked" },
      { title: "Web təhlükəsizliyi", meta: "Planlaşdırılır", status: "locked" },
    ],
  },
  {
    title: "Müdafiə və idarəetmə",
    subtitle: "Blue Team + GRC",
    description: "Təhdidləri analiz et, riski qiymətləndir və təşkilat üçün davamlı müdafiə qur.",
    icon: ShieldCheck,
    tone: "green",
    progress: 8,
    modules: [
      { title: "GRC əsasları", meta: "5 task · 650 XP", status: "active", href: "/rooms/grc-foundations" },
      { title: "Log və hadisə analizi", meta: "Tezliklə", status: "locked" },
      { title: "SOC əməliyyatları", meta: "Planlaşdırılır", status: "locked" },
    ],
  },
];

const phases = [
  { id: "01", label: "Təməl", title: "Kiber düşüncə", text: "Etika, terminologiya və risk anlayışları", status: "current" },
  { id: "02", label: "Praktika", title: "Analiz bacarığı", text: "Log, phishing və şəbəkə ssenariləri", status: "next" },
  { id: "03", label: "İxtisas", title: "Rol seçimi", text: "Red Team, Blue Team və ya GRC istiqaməti", status: "locked" },
  { id: "04", label: "Nailiyyət", title: "Yekun missiya", text: "Biliklərini birləşdirən kompleks ssenari", status: "locked" },
];

export default function RoadmapPage() {
  return (
    <main className="flex-1">
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="hero-glow absolute inset-0 -z-10" /><div className="cyber-grid absolute inset-0 -z-10 opacity-[0.14]" /><div className="hero-scan" />
        <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_390px] lg:items-end">
            <div><div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.055] px-3 py-1.5 text-[11px] font-semibold text-emerald-200"><Map className="size-3.5" />Şəxsi inkişaf xəritəsi</div><h1 className="mt-5 text-4xl font-semibold tracking-[-0.055em] text-white sm:text-5xl lg:text-[58px]">Kiber yolunu <span className="text-gradient">addım-addım qur.</span></h1><p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">İki istiqaməti paralel kəşf et, təməl Room-ları tamamla və marağına uyğun ixtisaslaşma yolunu aç.</p></div>
            <div className="roadmap-score-card relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black/25 p-5"><div className="card-radar card-radar--green" /><div className="relative flex items-center gap-4"><span className="grid size-12 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-300"><Target className="size-5" /></span><div className="flex-1"><div className="flex justify-between text-[10px]"><span className="font-semibold uppercase tracking-wider text-slate-500">Ümumi progress</span><span className="font-mono text-emerald-400">20%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full w-1/5 rounded-full bg-gradient-to-r from-red-500 to-emerald-400" /></div><p className="mt-2 text-[10px] text-slate-600">2 Room · 10 task · 1,150 XP</p></div></div></div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <section aria-labelledby="tracks-heading">
          <div className="mb-7"><p className="section-kicker">İstiqamətlər</p><h2 id="tracks-heading" className="section-title">Öyrənmə xətlərini seç</h2></div>
          <div className="grid gap-5 lg:grid-cols-2">
            {tracks.map((track) => {
              const Icon = track.icon;
              const red = track.tone === "red";
              return (
                <article key={track.title} className={`roadmap-track group relative overflow-hidden rounded-2xl border bg-[#1a1d1f] p-5 transition-all duration-500 hover:-translate-y-1 sm:p-7 ${red ? "border-red-300/15 hover:border-red-300/32" : "border-emerald-300/10 hover:border-emerald-300/28"}`}>
                  <div className={`card-radar ${red ? "card-radar--red" : "card-radar--green"}`} />
                  <div className="relative"><div className="flex items-start justify-between"><span className={`grid size-12 place-items-center rounded-2xl border ${red ? "border-red-300/20 bg-red-300/10 text-red-300" : "border-emerald-300/20 bg-emerald-300/10 text-emerald-300"}`}><Icon className="size-5 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110" /></span><span className={`font-mono text-xs font-bold ${red ? "text-red-300" : "text-emerald-300"}`}>{track.progress}%</span></div><p className={`mt-6 text-[10px] font-semibold uppercase tracking-[0.15em] ${red ? "text-red-400" : "text-emerald-400"}`}>{track.subtitle}</p><h3 className="mt-1 text-2xl font-semibold tracking-[-0.035em] text-white">{track.title}</h3><p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">{track.description}</p><div className="mt-5 h-1 overflow-hidden rounded-full bg-white/[0.055]"><div className={`h-full rounded-full ${red ? "bg-gradient-to-r from-red-700 to-red-400" : "bg-gradient-to-r from-emerald-700 to-emerald-400"}`} style={{ width: `${track.progress}%` }} /></div>
                    <div className="mt-6 space-y-2.5">
                      {track.modules.map((module) => module.href ? (
                        <Link key={module.title} href={module.href} prefetch className="group/module flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/15 p-3.5 transition-all hover:translate-x-1 hover:border-white/[0.14] hover:bg-white/[0.035]"><span className={`grid size-8 shrink-0 place-items-center rounded-lg ${red ? "bg-red-300/10 text-red-300" : "bg-emerald-300/10 text-emerald-300"}`}><CircleDot className="size-3.5" /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-200">{module.title}</span><span className="mt-0.5 block text-[9px] text-slate-600">{module.meta}</span></span><LinkLoadingIndicator /><ArrowRight className="size-3.5 text-slate-700 transition-all group-hover/module:translate-x-1 group-hover/module:text-white" /></Link>
                      ) : (
                        <div key={module.title} className="flex items-center gap-3 rounded-xl border border-dashed border-white/[0.06] p-3.5 opacity-55"><span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/[0.07] text-slate-700"><LockKeyhole className="size-3.5" /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium text-slate-500">{module.title}</span><span className="mt-0.5 block text-[9px] text-slate-700">{module.meta}</span></span></div>
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
              <article key={phase.id} className={`phase-card group relative rounded-2xl border p-5 transition-all duration-400 hover:-translate-y-1 ${phase.status === "current" ? "border-emerald-300/20 bg-emerald-300/[0.045]" : "border-red-300/10 bg-[#191b1d]"}`}>
                <span className={`relative z-10 grid size-14 place-items-center rounded-2xl border font-mono text-sm font-bold transition-transform duration-500 group-hover:-rotate-4 group-hover:scale-105 ${phase.status === "current" ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-300" : phase.status === "next" ? "border-red-300/20 bg-red-300/[0.07] text-red-300" : "border-white/[0.07] bg-[#191b1d] text-slate-700"}`}>{phase.status === "current" ? <Check className="size-5" /> : phase.id}</span><p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-600">{phase.label}</p><h3 className="mt-1 text-sm font-semibold text-slate-200">{phase.title}</h3><p className="mt-2 text-[11px] leading-5 text-slate-600">{phase.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="pt-16"><div className="achievement-banner group relative overflow-hidden rounded-2xl border border-emerald-300/10 p-6 sm:p-8"><div className="cyber-grid absolute inset-0 opacity-[0.12]" /><div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-red-300/20 bg-red-300/10 text-red-300 transition-transform group-hover:rotate-6"><Flag className="size-5" /></span><div><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-red-400">İlk hədəf</p><h2 className="mt-1 text-xl font-semibold text-white">Kiber düşüncə mərhələsini tamamla</h2><p className="mt-2 text-sm text-slate-500">İki açıq Room-u bitir və 1,150 XP qazan.</p></div></div><Link href="/rooms" prefetch className="primary-action shrink-0">Room-ları aç <LinkLoadingIndicator /><ArrowRight className="size-4" /><span className="button-sheen" /></Link></div></div></section>
      </div>
    </main>
  );
}
