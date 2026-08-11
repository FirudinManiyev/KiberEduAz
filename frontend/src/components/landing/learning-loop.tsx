import { BookOpenCheck, CheckCircle2, Crosshair, Zap } from "lucide-react";

const STEPS = [
  {
    icon: BookOpenCheck,
    label: "Oxu",
    title: "Mövzu qısa və dəqiq",
    text: "Task-ın başında nəzəri hissə var: nə baş verir, hansı əlamətlərə diqqət etmək lazımdır.",
    tone: "green" as const,
  },
  {
    icon: Crosshair,
    label: "Praktika et",
    title: "Ssenari üzərində işlə",
    text: "Log sətirləri, e-poçt başlıqları və ya şübhəli davranış nümunəsi verilir — qərarı sən verirsən.",
    tone: "red" as const,
  },
  {
    icon: CheckCircle2,
    label: "Yoxlanılsın",
    title: "Cavab dərhal yoxlanır",
    text: "Sistem cavabı server tərəfdə yoxlayır və nəyə görə doğru ya səhv olduğunu izah edir.",
    tone: "green" as const,
  },
  {
    icon: Zap,
    label: "Xal qazan",
    title: "İrəliləyiş qeydə alınır",
    text: "Doğru cavab xal gətirir, Room-un faizi artır, rütbə və seriya yenilənir.",
    tone: "amber" as const,
  },
];

export function LearningLoop() {
  return (
    <section id="nece-isleyir" className="scroll-mt-24 pt-14 lg:pt-20" aria-labelledby="loop-heading">
      <div className="max-w-2xl">
        <p className="section-kicker">Əsas fəlsəfə</p>
        <h2 id="loop-heading" className="section-title">
          Oxu → praktika et → yoxlanılsın → xal qazan
        </h2>
        <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
          Nəzəriyyə bir yerdə, praktika başqa yerdə deyil. Hər Task mövzunu izah edir və dərhal
          həmin mövzu üzərində sual verir. Şagird səhifədən çıxmadan tam dövrəni tamamlayır.
        </p>
      </div>

      <ol className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;

          return (
            <li key={step.label} className="metric-card group">
              <div className="metric-card__noise" />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-600">
                    Mərhələ {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-white">{step.label}</p>
                </div>
                <span className={`stat-icon stat-icon--${step.tone}`}>
                  <Icon className="size-[18px]" aria-hidden="true" />
                </span>
              </div>
              <div className="relative mt-5">
                <p className="text-sm font-semibold text-slate-200">{step.title}</p>
                <p className="mt-2 text-[12px] leading-5 text-slate-500">{step.text}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
