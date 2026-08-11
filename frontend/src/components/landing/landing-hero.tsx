import Link from "next/link";
import { ArrowRight, ChevronRight, Radar, ShieldCheck, SplitSquareVertical, Users } from "lucide-react";
import { LinkLoadingIndicator } from "@/components/feedback/link-loading-indicator";
import { CommandConsole } from "@/components/home/command-console";

const SIGNALS = [
  {
    icon: ShieldCheck,
    title: "Real VM yoxdur",
    text: "Ssenari və simulyasiya əsaslı praktika",
  },
  {
    icon: SplitSquareVertical,
    title: "Nəzəriyyə + praktika",
    text: "Dərs və sual eyni ekranda",
  },
  {
    icon: Users,
    title: "Sinif reytinqi",
    text: "Müqayisə qlobal deyil, sinifdaxilidir",
  },
];

export function LandingHero() {
  return (
    <section className="relative border-b border-white/[0.06]" aria-labelledby="hero-heading">
      <div className="hero-glow absolute inset-0 -z-10" />
      <div className="cyber-grid absolute inset-0 -z-10 opacity-[0.14]" />
      <div className="hero-scan" />

      <div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:px-10 lg:py-20">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-300/15 bg-red-300/[0.055] px-3 py-1.5 text-[11px] font-semibold text-red-200 shadow-[0_0_30px_rgba(239,68,68,.06)]">
            <Radar className="size-3.5 animate-pulse" aria-hidden="true" />
            Məktəb və kolleclər üçün kiber təlim mühiti
          </div>

          <h1
            id="hero-heading"
            className="text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.06em] text-white sm:text-5xl lg:text-[64px]"
          >
            Təhlükəni görməyi
            <br />
            <span className="text-gradient">sinifdə öyrənmək olar.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
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
            <Link href="/contact" prefetch className="secondary-action group">
              Məktəbim üçün danışaq
              <span className="flex items-center gap-2">
                <LinkLoadingIndicator />
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          </div>

          <ul className="mt-9 grid max-w-xl gap-2 sm:grid-cols-3 sm:gap-3">
            {SIGNALS.map((signal) => {
              const Icon = signal.icon;

              return (
                <li key={signal.title} className="hero-mini-stat group">
                  <Icon
                    className="size-4 text-emerald-400 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
                    aria-hidden="true"
                  />
                  <p className="mt-2 text-sm font-semibold text-white">{signal.title}</p>
                  <p className="mt-1 text-[11px] leading-4 text-slate-600">{signal.text}</p>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-[610px] lg:mr-0">
          <div className="absolute -inset-12 -z-10 rounded-full bg-red-500/[0.045] blur-3xl" />
          <CommandConsole ctaHref="/register" ctaLabel="Tam missiyalar üçün qeydiyyatdan keç" />
        </div>
      </div>
    </section>
  );
}
