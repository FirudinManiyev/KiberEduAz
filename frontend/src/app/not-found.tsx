import Link from "next/link";
import { ArrowLeft, ShieldX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-[70vh] flex-1 place-items-center px-4 py-16 text-center">
      <div>
        <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-rose-300/15 bg-rose-300/[0.06] text-rose-300">
          <ShieldX className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-6 font-mono text-sm text-emerald-400">ERROR_404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">Bu missiya tapılmadı</h1>
        <p className="mt-3 text-sm text-slate-500">Axtardığın səhifə silinib və ya ünvan dəyişib.</p>
        <Link href="/" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-emerald-950 hover:bg-emerald-300">
          <ArrowLeft className="size-4" aria-hidden="true" />
          İdarə panelinə qayıt
        </Link>
      </div>
    </main>
  );
}
