import { Award, Flame, Trophy, Zap } from "lucide-react";

const MECHANICS = [
  {
    icon: Zap,
    tone: "green" as const,
    title: "Xal",
    text: "Hər doğru cavabın dəyəri var, Room tamamlananda əlavə bonus verilir.",
  },
  {
    icon: Trophy,
    tone: "red" as const,
    title: "Rütbə",
    text: "Toplanan xal rütbəyə çevrilir və növbəti səviyyəyə qalan məsafə göstərilir.",
  },
  {
    icon: Award,
    tone: "green" as const,
    title: "Badge",
    text: "Konkret nailiyyətlər — ilk analiz Room-u, tam dəqiqliklə keçilmiş Task — ayrıca qeyd olunur.",
  },
  {
    icon: Flame,
    tone: "amber" as const,
    title: "Seriya",
    text: "Ardıcıl fəal günlər sayılır; rekord seriya profil üzərində qalır.",
  },
];

const SAMPLE_CLASS = [
  { rank: 1, name: "Sinif yoldaşı", initials: "AN", tone: "emerald" },
  { rank: 2, name: "Sinif yoldaşı", initials: "RM", tone: "red" },
  { rank: 3, name: "Sən", initials: "SN", tone: "violet", isYou: true },
  { rank: 4, name: "Sinif yoldaşı", initials: "EQ", tone: "dark" },
] as const;

export function GamificationSection() {
  return (
    <section id="gamifikasiya" className="scroll-mt-24 pt-14 lg:pt-20" aria-labelledby="game-heading">
      <div className="max-w-2xl">
        <p className="section-kicker">Motivasiya</p>
        <h2 id="game-heading" className="section-title">
          Gamifikasiya var, amma təzyiq yoxdur
        </h2>
        <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
          İrəliləyiş görünən olmalıdır — bunun üçün xal, rütbə, badge və seriya işləyir. Reytinq isə
          qəsdən qlobal deyil.
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          {MECHANICS.map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.title} className="metric-card group">
                <div className="metric-card__noise" />
                <div className="relative flex items-start gap-3">
                  <span className={`stat-icon stat-icon--${item.tone}`}>
                    <Icon className="size-[18px]" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                    <p className="mt-1.5 text-[12px] leading-5 text-slate-500">{item.text}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-2xl border border-red-300/10 bg-[#1a1d1f]">
          <div className="flex items-center justify-between border-b border-white/[0.065] px-5 py-5">
            <div>
              <p className="section-kicker section-kicker--red">Sinif daxilində</p>
              <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-white">Reytinq nümunəsi</h3>
            </div>
            <Trophy className="size-5 text-red-400" aria-hidden="true" />
          </div>

          <ul className="divide-y divide-white/[0.055]">
            {SAMPLE_CLASS.map((person) => (
              <li
                key={person.rank}
                className={`leader-row flex items-center gap-3 px-5 py-3.5 ${
                  "isYou" in person && person.isYou ? "bg-emerald-300/[0.045]" : ""
                }`}
              >
                <span
                  className={`w-5 text-center text-sm font-bold ${
                    person.rank <= 3 ? "text-red-300" : "text-slate-600"
                  }`}
                >
                  {person.rank}
                </span>
                <span className={`avatar avatar--${person.tone}`} aria-hidden="true">
                  {person.initials}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-300">
                  {person.name}
                </span>
                <span className="font-mono text-[11px] text-slate-600">•••</span>
              </li>
            ))}
          </ul>

          <p className="border-t border-white/[0.06] px-5 py-4 text-[11px] leading-5 text-slate-500">
            Şagird yalnız öz sinfi ilə müqayisə olunur — bütün ölkə ilə deyil. Yeniyetmə auditoriyası
            üçün bu, sağlam rəqabətlə həvəsdən düşmək arasındaki fərqi yaradır.
          </p>
        </div>
      </div>
    </section>
  );
}
