import { FileCheck2, QrCode, ScrollText } from "lucide-react";

export function CertificateSection() {
  return (
    <section id="sertifikat" className="scroll-mt-24 pt-14 lg:pt-20" aria-labelledby="cert-heading">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
        <div>
          <p className="section-kicker">Nəticə sənədi</p>
          <h2 id="cert-heading" className="section-title">
            Path tamamlanır — sertifikat avtomatik yaranır
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
            Şagird bir təlim istiqamətini sona qədər keçdikdə sistem PDF sertifikat hazırlayır.
            Sertifikatın üzərindəki QR kod doğrulama səhifəsinə aparır, yəni sənədin həqiqiliyini
            məktəb və ya işəgötürən özü yoxlaya bilər.
          </p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { icon: FileCheck2, label: "Avtomatik PDF" },
              { icon: QrCode, label: "QR ilə doğrulama" },
              { icon: ScrollText, label: "Path adı və tarix" },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.label} className="hero-mini-stat group flex items-center gap-2.5">
                  <Icon
                    className="size-4 shrink-0 text-emerald-400 transition-transform duration-300 group-hover:-rotate-6"
                    aria-hidden="true"
                  />
                  <span className="text-[12px] font-semibold text-slate-300">{item.label}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <figure className="relative overflow-hidden rounded-2xl border border-emerald-300/12 bg-[#1a1d1f] p-5 sm:p-7">
          <div className="cyber-grid absolute inset-0 opacity-[0.1]" aria-hidden="true" />
          <div className="relative rounded-xl border border-white/[0.08] bg-black/30 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-400">
                  KiberEduAz sertifikatı
                </p>
                <p className="mt-3 text-lg font-semibold tracking-[-0.03em] text-white">
                  Kiber başlanğıc
                </p>
                <p className="mt-1 text-[11px] text-slate-600">Path tamamlanma sənədi</p>
              </div>
              <span className="grid size-14 shrink-0 place-items-center rounded-lg border border-white/[0.12] bg-white/[0.04] text-slate-400">
                <QrCode className="size-8" aria-hidden="true" />
              </span>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/[0.07] pt-4 text-[10px]">
              <div>
                <dt className="uppercase tracking-[0.13em] text-slate-700">Doğrulama kodu</dt>
                <dd className="mt-1 font-mono text-slate-400">KEA-••••-••••</dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.13em] text-slate-700">Status</dt>
                <dd className="mt-1 flex items-center gap-1.5 font-mono text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                  DOĞRULANIB
                </dd>
              </div>
            </dl>
          </div>
          <figcaption className="relative mt-4 text-center text-[10px] text-slate-700">
            Nümunə görünüş — məlumatlar şagirdin öz irəliləyişindən doldurulur.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
