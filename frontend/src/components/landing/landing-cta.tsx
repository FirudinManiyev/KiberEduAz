import Link from "next/link";
import { ArrowRight, Building2, ChevronRight, Radar } from "lucide-react";
import { LinkLoadingIndicator } from "@/components/feedback/link-loading-indicator";

export function LandingCta() {
  return (
    <section className="pt-14 lg:pt-20" aria-labelledby="cta-heading">
      <div className="relative overflow-hidden rounded-2xl border border-red-300/12 p-6 sm:p-9 lg:p-12">
        <div className="hero-glow absolute inset-0" aria-hidden="true" />
        <div className="cyber-grid absolute inset-0 opacity-[0.12]" aria-hidden="true" />

        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-300/15 bg-red-300/[0.055] px-3 py-1.5 text-[11px] font-semibold text-red-200">
              <Radar className="size-3.5 animate-pulse" aria-hidden="true" />
              MVP mərhələsi · məzmun mütəmadi artır
            </div>
            <h2
              id="cta-heading"
              className="mt-5 text-balance text-2xl font-semibold tracking-[-0.05em] text-white sm:text-4xl"
            >
              İlk Room-u <span className="text-gradient">bu gün aç.</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base sm:leading-7">
              Şagird kimi qeydiyyatdan keçib mövcud təlimləri sınaya bilərsən. Məktəb və ya kollec
              adından yazırsansa, pilot şərtlərini komanda ilə birgə müzakirə edək.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/register" prefetch className="primary-action group w-full">
              <span className="relative z-10">Şagird kimi qeydiyyatdan keç</span>
              <span className="relative z-10 flex items-center gap-2">
                <LinkLoadingIndicator />
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
              <span className="button-sheen" />
            </Link>
            <Link href="/contact" prefetch className="secondary-action group w-full">
              <span className="flex items-center gap-2">
                <Building2 className="size-4" aria-hidden="true" />
                Məktəblər üçün əlaqə
              </span>
              <span className="flex items-center gap-2">
                <LinkLoadingIndicator />
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
            <p className="text-center text-[11px] text-slate-600">
              Artıq hesabın var?{" "}
              <Link href="/login" prefetch className="font-semibold text-emerald-300 hover:underline">
                Daxil ol
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
