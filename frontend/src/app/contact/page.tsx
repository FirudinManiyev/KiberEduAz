import type { Metadata } from "next";
import { Building2, ChevronDown, Clock3, Mail, MapPin, MessageCircle, Radio } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Əlaqə",
  description: "KiberEduAz komandası ilə əlaqə və təhsil müəssisələri üçün əməkdaşlıq səhifəsi.",
};

const contactCards = [
  {
    icon: Mail,
    label: "E-poçt",
    value: "info@kiberedu.az",
    note: "Ümumi suallar və təkliflər",
    tone: "red",
  },
  {
    icon: Building2,
    label: "Müəssisələr",
    value: "Məktəb və kolleclər",
    note: "Pilot və tərəfdaşlıq müraciətləri",
    tone: "green",
  },
  {
    icon: Clock3,
    label: "Cavab müddəti",
    value: "1–2 iş günü",
    note: "MVP komanda rejimi",
    tone: "red",
  },
];

const faqs = [
  {
    question: "Platformanı məktəbimizdə sınaqdan keçirə bilərik?",
    answer: "Bəli. Pilot mərhələ üçün məktəb və kolleclərdən gələn əməkdaşlıq müraciətləri ayrıca qiymətləndiriləcək.",
  },
  {
    question: "Təlimlər hansı yaş qrupu üçündür?",
    answer: "Məzmun əsasən məktəbin yuxarı sinifləri və kollec tələbələri üçün sadələşdirilmiş, təhlükəsiz ssenarilərdən ibarətdir.",
  },
  {
    question: "Real virtual maşın və ya hücum laboratoriyası varmı?",
    answer: "MVP-də real VM istifadə edilmir. Praktika log analizi, phishing araşdırması və interaktiv sual ssenariləri üzərində qurulub.",
  },
];

export default function ContactPage() {
  return (
    <main className="flex-1">
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="room-glow-red absolute inset-0 -z-10" />
        <div className="cyber-grid absolute inset-0 -z-10 opacity-[0.1]" />
        <div className="hero-scan" />
        <div className="mx-auto grid max-w-[1440px] gap-9 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_420px] lg:items-end lg:px-10 lg:py-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-300/15 bg-red-300/[0.065] px-3 py-1.5 text-[11px] font-semibold text-red-200">
              <Radio className="size-3.5 animate-pulse" aria-hidden="true" />
              Əlaqə kanalı aktivdir
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.055em] text-white sm:text-5xl lg:text-[58px]">
              Gəlin kiber təhsili <span className="text-gradient">birlikdə quraq.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
              Platforma, təlim məzmunu, məktəb pilotu və ya əməkdaşlıq barədə sualın varsa KiberEduAz komandası ilə əlaqə saxla.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-300/12 bg-[#1a1d1f]/75 p-5 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative size-2.5 rounded-full bg-emerald-400" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-200">Komanda kanalı açıqdır</p>
                <p className="mt-0.5 text-[10px] text-slate-600">Bakı vaxtı ilə iş günləri</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-4 text-[10px] text-slate-600">
              <MapPin className="size-3.5 text-red-400" aria-hidden="true" />
              Bakı, Azərbaycan
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        <div className="grid gap-3 sm:grid-cols-3">
          {contactCards.map((card) => {
            const Icon = card.icon;
            const red = card.tone === "red";
            return (
              <article key={card.label} className="metric-card group">
                <div className="metric-card__noise" />
                <div className="relative flex items-start gap-3">
                  <span className={`grid size-10 shrink-0 place-items-center rounded-xl border transition-transform duration-300 group-hover:-rotate-4 group-hover:scale-105 ${red ? "border-red-300/18 bg-red-300/[0.07] text-red-300" : "border-emerald-300/18 bg-emerald-300/[0.07] text-emerald-300"}`}>
                    <Icon className="size-[18px]" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-600">{card.label}</p>
                    <p className="mt-1.5 text-sm font-semibold text-white">{card.value}</p>
                    <p className="mt-1 text-[10px] text-slate-600">{card.note}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <ContactForm />

          <aside className="space-y-6">
            <div className="rounded-2xl border border-white/[0.07] bg-[#1a1d1f]/90 p-5 backdrop-blur-xl sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl border border-red-300/15 bg-red-300/[0.06] text-red-300">
                  <MessageCircle className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Tez-tez verilən suallar</p>
                  <p className="mt-0.5 text-[10px] text-slate-600">MVP haqqında qısa cavablar</p>
                </div>
              </div>

              <div className="mt-5 divide-y divide-white/[0.055] border-y border-white/[0.055]">
                {faqs.map((faq) => (
                  <details key={faq.question} className="contact-faq group">
                    <summary className="flex cursor-pointer list-none items-center gap-3 py-4 text-xs font-semibold text-slate-300 transition-colors hover:text-white">
                      <span className="flex-1">{faq.question}</span>
                      <ChevronDown className="size-4 shrink-0 text-slate-600 transition-transform duration-300 group-open:rotate-180 group-open:text-red-400" aria-hidden="true" />
                    </summary>
                    <p className="pb-4 pr-6 text-[11px] leading-5 text-slate-500">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>

            <div className="achievement-banner group relative overflow-hidden rounded-2xl border border-emerald-300/10 p-5 sm:p-6">
              <div className="cyber-grid absolute inset-0 opacity-[0.1]" />
              <div className="relative">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-400">Təhsil müəssisələri üçün</p>
                <h2 className="mt-2 text-lg font-semibold text-white">Pilot proqramda maraqlısınız?</h2>
                <p className="mt-2 text-xs leading-5 text-slate-500">Məktəbinizi, tələbə sayını və gözlədiyiniz təlim istiqamətini mesajda qeyd edin.</p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
