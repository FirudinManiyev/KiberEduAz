import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Radar,
  Target,
} from "lucide-react";
import { LinkLoadingIndicator } from "@/components/feedback/link-loading-indicator";
import { CyberHeroShell } from "@/components/hero/cyber-hero-shell";

const MISSION_STEPS = [
  { label: "Mövzunu öyrən", detail: "Qısa və fokuslanmış dərs", status: "Başla" },
  { label: "Ssenarini analiz et", detail: "Real hadisəyə əsaslanan tapşırıq", status: "Praktika" },
  { label: "Cavabını yoxla", detail: "Ani nəticə və izah", status: "+XP" },
];

export function LandingHero() {
  return (
    <CyberHeroShell ariaLabelledby="hero-heading">
      <div className="mx-auto grid min-h-[inherit] max-w-[1440px] gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.04fr_.96fr] lg:items-center lg:px-10 lg:py-20">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-300/20 bg-black/35 px-3 py-1.5 text-[11px] font-semibold text-red-100 shadow-[0_0_35px_rgba(239,68,68,.12)] backdrop-blur-md">
            <Radar className="size-3.5 animate-pulse" aria-hidden="true" />
            Məktəb və kolleclər üçün kiber təlim mühiti
          </div>

          <h1
            id="hero-heading"
            className="text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.06em] text-white drop-shadow-[0_8px_28px_rgba(0,0,0,.45)] sm:text-5xl lg:text-[64px]"
          >
            Təhlükəni görməyi
            <br />
            <span className="text-gradient">sinifdə öyrənmək olar.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            KiberEduAz məktəb və kolleclərdə İT və kibertəhlükəsizlik təlimlərini rəqəmsal şəkildə
            təşkil edir. Şagird mövzunu oxuyur, real ssenari üzərində praktika edir, cavabı dərhal
            yoxlanılır və xal qazanır — hər şey bir səhifədə.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" prefetch className="primary-action group">
              <span className="relative z-10">Pulsuz hesab yarat</span>
              <span className="relative z-10 flex items-center gap-2">
                <LinkLoadingIndicator />
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
              <span className="button-sheen" />
            </Link>
            <Link href="/contact" prefetch className="secondary-action group bg-black/30 backdrop-blur-md">
              Məktəbim üçün danışaq
              <span className="flex items-center gap-2">
                <LinkLoadingIndicator />
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          </div>

        </div>

        <div className="relative mx-auto w-full min-w-0 max-w-[600px] lg:mr-0">
          <div className="absolute -inset-5 -z-10 rounded-[2rem] border border-red-300/[0.08] bg-red-400/[0.025] blur-[1px]" />
          <div className="absolute -right-5 -top-5 size-24 rounded-3xl border border-emerald-300/10 bg-emerald-300/[0.04] backdrop-blur-sm" />
          <div className="cyber-hero-panel p-5 sm:p-7">
            <div className="relative flex items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
              <div>
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                  <Activity className="size-3.5" aria-hidden="true" /> Praktik tədris axını
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em] text-white sm:text-2xl">
                  İlk kiber missiyan
                </h2>
              </div>
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-red-300/20 bg-red-300/[0.08] text-red-200 shadow-[0_0_35px_rgba(239,68,68,.12)]">
                <Target className="size-5" aria-hidden="true" />
              </span>
            </div>

            <div className="relative mt-6 rounded-2xl border border-white/[0.075] bg-black/25 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Missiya hazırlığı</span>
                <span className="font-mono text-emerald-300">03 mərhələ</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-red-500 via-amber-300 to-emerald-400 shadow-[0_0_18px_rgba(52,211,153,.35)]" />
              </div>
            </div>

            <ol className="relative mt-4 space-y-2.5">
              {MISSION_STEPS.map((step, index) => (
                <li
                  key={step.label}
                  className="group flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5 transition-colors hover:border-emerald-300/20 hover:bg-emerald-300/[0.045]"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/[0.09] bg-black/25 font-mono text-[11px] font-bold text-slate-300">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-100">{step.label}</span>
                    <span className="mt-0.5 block truncate text-[11px] text-slate-500">{step.detail}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/15 bg-emerald-300/[0.07] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-200">
                    <CheckCircle2 className="size-3" aria-hidden="true" /> {step.status}
                  </span>
                </li>
              ))}
            </ol>

            <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-5 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-400" aria-hidden="true" />
                Addım-addım öyrənmə
              </span>
              <span className="font-mono text-slate-400">ÖYRƏN · ANALİZ ET · QAZAN</span>
            </div>
          </div>
        </div>
      </div>
    </CyberHeroShell>
  );
}
