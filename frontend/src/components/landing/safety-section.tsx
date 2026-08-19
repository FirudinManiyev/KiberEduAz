import { Eye, ServerOff, ShieldCheck, TerminalSquare } from "lucide-react";

const GUARANTEES = [
  {
    icon: ServerOff,
    title: "Virtual maşın yoxdur",
    text: "Şagirdə hücum aləti verilmir, canlı sistemə çıxış açılmır. Praktika tam olaraq platformanın içindədir.",
  },
  {
    icon: Eye,
    title: "Müdafiə tərəfindən baxış",
    text: "Diqqət hücum texnikasına deyil, təhdidi tanımağa və düzgün reaksiya verməyə yönəlib.",
  },
  {
    icon: TerminalSquare,
    title: "Sintetik material",
    text: "Bütün log, e-poçt və hadisə nümunələri təlim üçün hazırlanıb — real şəxsi məlumat işlənmir.",
  },
];

export function SafetySection() {
  return (
    <section id="tehlukesizlik" className="scroll-mt-24 pt-14 lg:pt-20" aria-labelledby="safety-heading">
      <div className="achievement-banner relative overflow-hidden rounded-2xl border border-emerald-300/12 p-6 sm:p-8 lg:p-10">
        <div className="cyber-grid absolute inset-0 opacity-[0.1]" aria-hidden="true" />

        <div className="relative grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/18 bg-emerald-300/[0.06] px-3 py-1.5 text-[11px] font-semibold text-emerald-200">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Yeniyetmə auditoriyası üçün təhlükəsizdir
            </div>
            <h2 id="safety-heading" className="mt-5 text-2xl font-semibold tracking-[-0.045em] text-white sm:text-3xl">
              Bu, hakerlik dərsi deyil.
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-400 sm:text-base sm:leading-7">
              Platformada real virtual maşın, canlı hədəf və ya istismar aləti yoxdur. Bütün
              praktika simulyasiya və ssenari üzərində qurulub. Bu, məktəb şəraitində istifadə üçün
              şüurlu seçimdir: şagird təhdidi tanımağı öyrənir, onu törətməyi yox.
            </p>
          </div>

          <ul className="grid gap-3">
            {GUARANTEES.map((item) => {
              const Icon = item.icon;

              return (
                <li
                  key={item.title}
                  className="flex items-start gap-4 rounded-xl border border-white/[0.07] bg-black/25 p-4 transition-colors hover:border-emerald-300/20"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-emerald-300/16 bg-emerald-300/[0.07] text-emerald-300">
                    <Icon className="size-[18px]" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                    <p className="mt-1.5 text-[12px] leading-5 text-slate-500">{item.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
