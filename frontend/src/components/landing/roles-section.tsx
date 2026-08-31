import { Check, Compass, Presentation, ShieldCheck, Sparkles } from "lucide-react";

const LEARNING_PATHS = [
  {
    icon: Compass,
    name: "Yeni başlayan",
    lead: "Sıfırdan aydın yol",
    intro: "Kiber sahəyə ilk dəfə daxil olursansa, əsas anlayışları qarışıqlıq yaşamadan öz tempində öyrən.",
    items: [
      "Əvvəlcədən texniki bilik tələb etməyən başlanğıc Path-ləri",
      "Terminləri sadə dillə izah edən addım-addım Room-lar",
      "Təhlükəsiz ssenarilərlə öz tempində praktika",
    ],
    accent: "green" as const,
  },
  {
    icon: ShieldCheck,
    name: "Bacarıqlarını inkişaf etdirən",
    lead: "Bilikdən praktikaya",
    intro: "Artıq təməlin varsa, real ssenarilərə yaxın tapşırıqlarla biliklərini daha güclü bacarığa çevir.",
    items: [
      "Blue Team, Red Team, SOC və GRC istiqamətləri",
      "Ssenari, sual və tasklarla praktiki möhkəmləndirmə",
      "Xal, seriya və irəliləyiş göstəricisi ilə davamlı inkişaf",
    ],
    accent: "red" as const,
  },
  {
    icon: Presentation,
    name: "Bilik paylaşan",
    lead: "Öyrət və istiqamət ver",
    intro: "Təlimçi, mentor və ya komanda rəhbərisənsə, biliyini sistemli təlim yoluna çevir və paylaş.",
    items: [
      "Path, Module, Room və Task-lardan öz təlim axınını qur",
      "Məzmunu fərdi öyrənən, komanda və ya siniflə paylaş",
      "İştirakçıların irəliləyişini aydın şəkildə izlə",
    ],
    accent: "green" as const,
  },
];

export function RolesSection() {
  return (
    <section id="rollar" className="scroll-mt-24 pt-14 lg:pt-20" aria-labelledby="roles-heading">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="section-kicker section-kicker--red">Üç öyrənmə yolu</p>
          <h2 id="roles-heading" className="section-title">
            Kiber öyrənmək istəyən hər kəs üçün
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
            İstər sıfırdan başla, istər biliyini praktikada gücləndir, istər başqalarına öyrət — KiberEduAz
            sənin mərhələnə uyğun aydın yol təqdim edir.
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.15em] text-slate-500 sm:text-[10px]">
          <Sparkles className="size-3.5 text-emerald-300" aria-hidden="true" />
          <span>Başla</span>
          <span className="text-slate-700">·</span>
          <span>İnkişaf et</span>
          <span className="text-slate-700">·</span>
          <span>Paylaş</span>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {LEARNING_PATHS.map((path, index) => {
          const Icon = path.icon;
          const green = path.accent === "green";

          return (
            <article
              key={path.name}
              className="group relative flex min-h-full flex-col overflow-hidden rounded-2xl border border-white/[0.075] bg-linear-to-br from-[#1b1e20] to-[#161819] p-5 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1.5 hover:border-white/[0.15] hover:shadow-[0_24px_60px_rgba(0,0,0,.24)] sm:p-6"
            >
              <div
                className={`absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent to-transparent ${
                  green ? "via-emerald-300/60" : "via-red-400/60"
                }`}
                aria-hidden="true"
              />
              <div
                className={`absolute -right-16 -top-16 size-40 rounded-full blur-3xl ${
                  green ? "bg-emerald-400/[0.055]" : "bg-red-500/[0.055]"
                }`}
                aria-hidden="true"
              />

              <div className="relative flex items-start justify-between gap-4">
                <span
                  className={`grid size-12 shrink-0 place-items-center rounded-2xl border transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105 ${
                    green
                      ? "border-emerald-300/20 bg-emerald-300/[0.075] text-emerald-300"
                      : "border-red-300/20 bg-red-300/[0.075] text-red-300"
                  }`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="font-mono text-3xl font-semibold tracking-[-0.08em] text-white/[0.045]">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="relative mt-6">
                <p
                  className={`font-mono text-[9px] uppercase tracking-[0.18em] ${
                    green ? "text-emerald-300/70" : "text-red-300/70"
                  }`}
                >
                  {path.lead}
                </p>
                <h3 className="mt-2 text-lg font-semibold leading-snug text-white">{path.name}</h3>
                <p className="mt-3 text-[12px] leading-5 text-slate-500">{path.intro}</p>
              </div>

              <ul className="relative mt-5 flex-1 space-y-3 border-t border-white/[0.055] pt-5">
                {path.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[12px] leading-5 text-slate-400">
                    <span
                      className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full ${
                        green ? "bg-emerald-300/[0.09] text-emerald-300" : "bg-red-300/[0.09] text-red-300"
                      }`}
                    >
                      <Check className="size-2.5" strokeWidth={2.5} aria-hidden="true" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
