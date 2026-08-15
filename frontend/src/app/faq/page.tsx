import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HelpCircle, MessageCircle, Sparkles } from "lucide-react";
import { FaqBrowser } from "@/components/faq/faq-browser";
import { LinkLoadingIndicator } from "@/components/feedback/link-loading-indicator";

export const metadata: Metadata = {
  title: "Tez-tez verilən suallar",
  description: "KiberEduAz platforması, hesablar, Room progress-i və müəllim rolları haqqında cavablar.",
};

export default function FaqPage() {
  return (
    <main className="flex-1">
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="room-glow-red absolute inset-0 -z-10" />
        <div className="cyber-grid absolute inset-0 -z-10 opacity-[0.12]" />
        <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_390px] lg:items-center lg:px-10 lg:py-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-300/15 bg-red-300/[0.06] px-3 py-1.5 text-[11px] font-semibold text-red-100"><HelpCircle className="size-3.5" />Dəstək mərkəzi</div>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.055em] text-white sm:text-5xl lg:text-[58px]">Sualın varsa, <span className="text-gradient">cavab buradadır.</span></h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">Platformadan istifadə, giriş, progress və müəllim hesabları haqqında ən çox soruşulan mövzuları bir yerdə topladıq.</p>
            <div className="mt-6 flex flex-wrap gap-2 text-[10px] font-semibold text-slate-400"><span className="rounded-full border border-white/[0.08] bg-black/20 px-3 py-1.5">12+ cavab</span><span className="rounded-full border border-white/[0.08] bg-black/20 px-3 py-1.5">4 kateqoriya</span><span className="rounded-full border border-white/[0.08] bg-black/20 px-3 py-1.5">Azərbaycanca</span></div>
          </div>
          <div className="group relative aspect-[16/11] overflow-hidden rounded-2xl border border-red-300/12 bg-[#181b1d]">
            <Image src="/images/cybershield_photo.png" alt="KiberEduAz dəstək və təhlükəsizlik qalxanı" fill priority sizes="(min-width: 1024px) 390px, 100vw" className="object-contain p-5 transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#151719] via-transparent to-transparent" />
            <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-[#121416]/85 px-3 py-1.5 text-[10px] font-semibold text-emerald-200 backdrop-blur"><Sparkles className="size-3.5" />Sürətli cavablar</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14"><FaqBrowser /></section>

      <section className="mx-auto max-w-[1100px] px-4 pb-14 sm:px-6 lg:px-10 lg:pb-20">
        <div className="achievement-banner group relative overflow-hidden rounded-2xl border border-red-300/12 p-6 sm:p-8">
          <div className="cyber-grid absolute inset-0 opacity-[0.1]" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl border border-red-300/20 bg-red-300/10 text-red-300"><MessageCircle className="size-5" /></span><div><h2 className="text-xl font-semibold text-white">Cavabını tapmadın?</h2><p className="mt-1.5 text-sm text-slate-500">Əlaqə formasından sualını göndər, komanda sənə cavab versin.</p></div></div><Link href="/contact" prefetch className="primary-action shrink-0">Bizimlə əlaqə <LinkLoadingIndicator /><ArrowRight className="size-4" /><span className="button-sheen" /></Link></div>
        </div>
      </section>
    </main>
  );
}

