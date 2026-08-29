"use client";

import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

export function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="grid min-h-[68vh] flex-1 place-items-center px-4 py-16">
      <section className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-red-300/15 bg-[#171a1d]/95 p-7 text-center shadow-[0_30px_110px_rgba(0,0,0,.45)] sm:p-10">
        <div className="cyber-grid pointer-events-none absolute inset-0 opacity-[0.08]" aria-hidden="true" />
        <div className="relative">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-red-300/20 bg-red-300/[0.07] text-red-300">
            <AlertTriangle className="size-7" aria-hidden="true" />
          </span>
          <p className="section-kicker section-kicker--red mt-6">Bağlantı kəsildi</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
            Səhifəni açmaq mümkün olmadı
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
            Məlumatları yükləyərkən problem yarandı. Bir az sonra yenidən cəhd edə bilərsən.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={retry} className="primary-action">
              <RotateCcw className="size-4" aria-hidden="true" />
              Yenidən cəhd et
            </button>
            <Link href="/" className="secondary-action">
              <Home className="size-4" aria-hidden="true" />
              Ana səhifə
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ErrorPage;
