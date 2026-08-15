import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <main className="route-loading flex-1" aria-label="Səhifə yüklənir" role="status">
      <div className="route-loading__beam" />
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-red-300/12 bg-red-300/[0.045] px-3 py-1.5 text-[10px] font-semibold text-red-100">
          <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
          Səhifə hazırlanır, təhlükəsiz bağlantı qurulur…
        </div>
        <div className="skeleton-line h-4 w-32" />
        <div className="skeleton-line mt-5 h-12 max-w-xl" />
        <div className="skeleton-line mt-4 h-5 max-w-2xl" />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="skeleton-card h-72 rounded-2xl" />
          ))}
        </div>
      </div>
    </main>
  );
}
