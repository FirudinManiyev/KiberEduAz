import {
  ArrowRight,
  Boxes,
  CircleHelp,
  DoorOpen,
  ListChecks,
  Route,
  Sparkles,
} from "lucide-react";

const LEVELS = [
  {
    icon: Route,
    name: "Path",
    label: "İstiqamət",
    text: "Məqsədə aparan bütöv öyrənmə yolu: kiber gigiyena, müdafiə, pentest və daha çox.",
  },
  {
    icon: Boxes,
    name: "Module",
    label: "Mövzu bloku",
    text: "Böyük istiqaməti fokuslanmış mövzulara bölür və növbəti addımı aydın saxlayır.",
  },
  {
    icon: DoorOpen,
    name: "Room",
    label: "Təlim mühiti",
    text: "Müddəti, çətinliyi və xal dəyəri olan nəzəri-praktik öyrənmə sessiyasıdır.",
  },
  {
    icon: ListChecks,
    name: "Task",
    label: "Praktik addım",
    text: "Bir anlayışı mərhələli şəkildə öyrədən izah və ona bağlı praktik yoxlamadır.",
  },
  {
    icon: CircleHelp,
    name: "Sual",
    label: "Ani yoxlama",
    text: "Biliyi dərhal yoxlayır, nəticəni göstərir və hansı mövzuya qayıtmalı olduğunu bildirir.",
  },
];

export function ContentStructure() {
  return (
    <section id="struktur" className="scroll-mt-24 pt-14 lg:pt-20" aria-labelledby="structure-heading">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#171a1c] shadow-[0_30px_90px_rgba(0,0,0,.24)]">
        <div className="cyber-grid absolute inset-0 opacity-[0.16]" aria-hidden="true" />
        <div
          className="absolute -right-24 -top-36 size-80 rounded-full bg-emerald-400/[0.08] blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-44 -left-24 size-80 rounded-full bg-red-500/[0.06] blur-3xl"
          aria-hidden="true"
        />

        <div className="relative p-5 sm:p-7 lg:p-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="section-kicker section-kicker--red">Məzmun arxitekturası</p>
              <h2 id="structure-heading" className="section-title">
                Bir baxışda bütün öyrənmə yolu
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-400 sm:text-base sm:leading-7">
                Böyük bir kiber istiqamətdən konkret suala qədər hər mərhələ bir-birini tamamlayır. Nə
                öyrəndiyini, harada olduğunu və növbəti addımını hər zaman aydın görürsən.
              </p>
            </div>

            <div className="flex w-fit items-center gap-3 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.055] px-4 py-3 text-emerald-100">
              <span className="grid size-9 place-items-center rounded-xl bg-emerald-300/10 text-emerald-300">
                <Sparkles className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-300/65">
                  Sadə struktur
                </p>
                <p className="mt-0.5 text-xs font-semibold">5 qat · 1 davamlı yol</p>
              </div>
            </div>
          </div>

          <ol
            aria-label="Məzmunun beş səviyyəli axını"
            className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          >
            {LEVELS.map((level, index) => {
              const Icon = level.icon;
              const green = index % 2 === 0;

              return (
                <li
                  key={level.name}
                  data-structure-level={index + 1}
                  className="group relative min-h-52 overflow-visible rounded-2xl border border-white/[0.07] bg-[#1d2022]/90 p-5 transition-[transform,border-color,background-color,box-shadow] duration-300 hover:-translate-y-1.5 hover:border-white/[0.15] hover:bg-[#202426] hover:shadow-[0_20px_45px_rgba(0,0,0,.22)]"
                >
                  <div
                    className={`absolute inset-x-5 top-0 h-px bg-linear-to-r from-transparent to-transparent ${
                      green ? "via-emerald-300/65" : "via-red-400/65"
                    }`}
                    aria-hidden="true"
                  />

                  <div className="flex items-center justify-between">
                    <span
                      className={`grid size-10 place-items-center rounded-xl border transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105 ${
                        green
                          ? "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-300"
                          : "border-red-300/20 bg-red-300/[0.08] text-red-300"
                      }`}
                    >
                      <Icon className="size-[18px]" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.18em] text-slate-700">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <p
                    className={`mt-5 font-mono text-[9px] uppercase tracking-[0.18em] ${
                      green ? "text-emerald-300/65" : "text-red-300/65"
                    }`}
                  >
                    {level.label}
                  </p>
                  <h3 className="mt-1.5 text-base font-semibold text-white">{level.name}</h3>
                  <p className="mt-2.5 text-[12px] leading-5 text-slate-500">{level.text}</p>

                  {index < LEVELS.length - 1 ? (
                    <span
                      className="absolute -right-[15px] top-1/2 z-10 hidden size-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#171a1c] text-slate-600 xl:flex"
                      aria-hidden="true"
                    >
                      <ArrowRight className="size-3.5" />
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>

          <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-white/[0.06] pt-5 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600 sm:text-[10px]">
            <span>İstiqaməti seç</span>
            <ArrowRight className="size-3 text-emerald-300/50" aria-hidden="true" />
            <span>Mövzunu aç</span>
            <ArrowRight className="size-3 text-emerald-300/50" aria-hidden="true" />
            <span>Room-a daxil ol</span>
            <ArrowRight className="size-3 text-emerald-300/50" aria-hidden="true" />
            <span>Praktikanı tamamla</span>
            <ArrowRight className="size-3 text-emerald-300/50" aria-hidden="true" />
            <span className="text-emerald-300/70">Nəticəni gör</span>
          </div>
        </div>
      </div>
    </section>
  );
}
