import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  School,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { LinkLoadingIndicator } from "@/components/feedback/link-loading-indicator";
import { CyberHeroShell } from "@/components/hero/cyber-hero-shell";

export const metadata: Metadata = {
  title: "Haqqımızda",
  description:
    "KiberEduAz-ın məktəb və kolleclər üçün təhlükəsiz, ssenari əsaslı kibertəhlükəsizlik təlim yanaşması ilə tanış olun.",
  alternates: { canonical: "/about" },
};

const PRINCIPLES = [
  {
    icon: BookOpenCheck,
    title: "Praktika ilə öyrənmə",
    text: "Mövzu izahdan dərhal sonra ssenari və yoxlama ilə möhkəmlənir.",
    tone: "emerald",
  },
  {
    icon: Users,
    title: "Sinif üçün görünürlük",
    text: "Şagird irəliləyişini görür, müəllim isə təlim axınını vahid mərkəzdən idarə edir.",
    tone: "red",
  },
  {
    icon: ShieldCheck,
    title: "Təhlükəsiz simulyasiya",
    text: "Real sistemlərə zərər vermədən kiber düşüncə və düzgün qərarvermə məşq edilir.",
    tone: "emerald",
  },
] as const;

const ROLE_FLOW = [
  { icon: School, label: "Məktəb", text: "Təlim mühitini və sinif strukturunu qurur." },
  { icon: GraduationCap, label: "Müəllim", text: "Məzmunu, Room-ları və şagird axınını idarə edir." },
  { icon: Users, label: "Şagird", text: "Missiyaları tamamlayır, izah alır və inkişafını izləyir." },
];

export default function AboutPage() {
  return (
    <main className="flex-1 overflow-hidden">
      <CyberHeroShell ariaLabelledby="about-heading" className="about-hero">
        <div className="mx-auto grid min-h-[inherit] max-w-[1440px] gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.04fr_.96fr] lg:items-center lg:px-10">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-black/35 px-3 py-1.5 text-[11px] font-semibold text-emerald-100 backdrop-blur-md">
              <Sparkles className="size-3.5" aria-hidden="true" /> KiberEduAz haqqında
            </p>
            <h1
              id="about-heading"
              className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.055em] text-white drop-shadow-[0_8px_28px_rgba(0,0,0,.45)] sm:text-5xl lg:text-[62px]"
            >
              Kiber bacarıqları
              <br />
              <span className="text-gradient">daha əlçatan edirik.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              KiberEduAz məktəb və kolleclərdə kibertəhlükəsizliyin sadəcə oxunan mövzu deyil, təhlükəsiz şəkildə məşq edilən bacarıq olmasına kömək edir.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/rooms" prefetch className="primary-action group">
                Room-ları kəşf et
                <span className="flex items-center gap-2"><LinkLoadingIndicator /><ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
                <span className="button-sheen" />
              </Link>
              <Link href="/contact" prefetch className="secondary-action group bg-black/30 backdrop-blur-md">
                Bizimlə danış
                <span className="flex items-center gap-2"><LinkLoadingIndicator /><ChevronRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
              </Link>
            </div>
          </div>

          <aside className="cyber-hero-panel p-5 sm:p-7" aria-label="Platformanın məqsədi">
            <div className="relative flex items-start justify-between gap-4 border-b border-white/[0.08] pb-5">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-red-300">Missiyamız</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Öyrənməyi hərəkətə çevirmək</h2>
              </div>
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-200">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </span>
            </div>
            <p className="relative mt-5 text-sm leading-7 text-slate-400">
              Məqsədimiz şagirdə kiber hadisəni görmək, səbəbini anlamaq və doğru reaksiyanı seçmək vərdişi qazandıran müasir təlim mühiti yaratmaqdır.
            </p>
            <ul className="relative mt-5 space-y-3">
              {["Azərbaycan dilində aydın öyrənmə axını", "Ssenari əsaslı praktiki Room-lar", "Müəllim və sinif üçün ölçülə bilən inkişaf"].map((item) => (
                <li key={item} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/20 px-3.5 py-3 text-sm text-slate-300">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </CyberHeroShell>

      <div className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 lg:px-10 lg:pb-24">
        <section className="pt-14 lg:pt-20" aria-labelledby="principles-heading">
          <div className="max-w-2xl">
            <p className="section-kicker">Yanaşmamız</p>
            <h2 id="principles-heading" className="section-title">Sadə görünən, güclü öyrənmə sistemi</h2>
            <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
              Platformanın hər hissəsi şagirdin mövzunu anlamasına, tətbiq etməsinə və nəticəsini görməsinə xidmət edir.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {PRINCIPLES.map((principle) => {
              const Icon = principle.icon;
              const green = principle.tone === "emerald";

              return (
                <article key={principle.title} className="metric-card group min-h-56">
                  <div className="metric-card__noise" />
                  <span className={`stat-icon relative ${green ? "stat-icon--green" : "stat-icon--red"}`}>
                    <Icon className="size-[18px]" aria-hidden="true" />
                  </span>
                  <h3 className="relative mt-6 text-lg font-semibold tracking-[-0.025em] text-white">{principle.title}</h3>
                  <p className="relative mt-3 text-sm leading-6 text-slate-500">{principle.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid gap-8 pt-14 lg:grid-cols-[.92fr_1.08fr] lg:items-center lg:pt-20" aria-labelledby="ecosystem-heading">
          <figure className="group relative aspect-[16/11] overflow-hidden rounded-3xl border border-white/[0.09] bg-[#15191c] shadow-[0_28px_90px_rgba(0,0,0,.28)]">
            <Image
              src="/images/cyber_class_photo.jpg"
              alt="Kibertəhlükəsizlik təlimində birlikdə çalışan şagirdlər"
              fill
              sizes="(min-width: 1024px) 44vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111518] via-transparent to-black/10" />
            <figcaption className="absolute inset-x-5 bottom-5 rounded-xl border border-white/[0.09] bg-black/45 px-4 py-3 text-xs text-slate-300 backdrop-blur-md">
              Məktəb, müəllim və şagird eyni öyrənmə axınında
            </figcaption>
          </figure>

          <div>
            <p className="section-kicker section-kicker--red">Birgə ekosistem</p>
            <h2 id="ecosystem-heading" className="section-title">Hər rolun aydın işi var</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
              Kiber təhsil ən yaxşı nəticəni məktəb təşkil etdikdə, müəllim istiqamət verdikdə və şagird aktiv praktika etdikdə verir.
            </p>
            <ol className="mt-7 space-y-3">
              {ROLE_FLOW.map((role, index) => {
                const Icon = role.icon;

                return (
                  <li key={role.label} className="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 transition-all hover:translate-x-1 hover:border-emerald-300/18 hover:bg-emerald-300/[0.035]">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-red-300/15 bg-red-300/[0.065] text-red-300">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-3">
                        <strong className="text-sm font-semibold text-slate-100">{role.label}</strong>
                        <span className="font-mono text-[10px] text-slate-700">0{index + 1}</span>
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">{role.text}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section className="pt-14 lg:pt-20" aria-labelledby="about-cta-heading">
          <div className="relative overflow-hidden rounded-3xl border border-red-300/12 bg-linear-to-br from-[#1c2023] to-[#151719] p-6 sm:p-9 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div className="cyber-grid absolute inset-0 opacity-[0.08]" />
            <div className="relative max-w-2xl">
              <p className="section-kicker">Növbəti addım</p>
              <h2 id="about-cta-heading" className="section-title">Kiber öyrənmə yoluna başlamağa hazırsan?</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">Hesab yarat, Room seç və ilk təhlükəsizlik missiyanı tamamla.</p>
            </div>
            <Link href="/register" prefetch className="primary-action group relative mt-6 shrink-0 lg:mt-0">
              Pulsuz hesab yarat
              <span className="flex items-center gap-2"><LinkLoadingIndicator /><ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
              <span className="button-sheen" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

