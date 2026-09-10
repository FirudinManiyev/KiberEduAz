import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Clock3, Mail, MapPin, MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { LinkLoadingIndicator } from "@/components/feedback/link-loading-indicator";

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
    note: "Komandanın standart cavab müddəti",
    tone: "red",
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
              <MessageCircle className="size-3.5" aria-hidden="true" />
              KiberEduAz ilə əlaqə
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
              <span className="grid size-9 place-items-center rounded-xl border border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-300">
                <Mail className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-200">Mesajını bizə göndər</p>
                <p className="mt-0.5 text-[10px] text-slate-600">Adətən 1–2 iş günü ərzində cavab veririk</p>
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
                  <p className="mt-0.5 text-[10px] text-slate-600">Platforma haqqında qısa cavablar</p>
                </div>
              </div>

              <p className="mt-5 border-t border-white/[0.055] pt-5 text-xs leading-5 text-slate-500">
                Hesab, təlimlər, müəllim imkanları və təhlükəsiz praktika haqqında cavabları ayrıca FAQ
                səhifəsində topladıq.
              </p>
              <Link
                href="/faq"
                prefetch
                className="group mt-5 inline-flex w-full items-center justify-between rounded-xl border border-red-300/15 bg-red-300/[0.055] px-4 py-3 text-sm font-semibold text-red-100 transition-all hover:border-red-300/30 hover:bg-red-300/[0.09]"
              >
                Bütün sual və cavablara bax
                <span className="flex items-center gap-2">
                  <LinkLoadingIndicator />
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
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
