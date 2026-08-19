import { Footprints, Radar, Target } from "lucide-react";

const TYPES = [
  {
    icon: Footprints,
    name: "Walkthrough",
    tagline: "Addım-addım rəhbərlikli",
    text: "Yeni mövzuya girişdə istifadə olunur. Şagird izahı oxuyur, hər addımda kiçik yoxlama keçir və heç bir yerdə tək qalmır.",
    bullets: ["İzahlı nəzəri hissə", "Kiçik və tez yoxlamalar", "Səhv cavabda istiqamətləndirmə"],
    accent: "green" as const,
  },
  {
    icon: Target,
    name: "Challenge",
    tagline: "Müstəqil düşüncə",
    text: "Mövzu artıq öyrənilib. Burada ipucu minimuma düşür — şagird qərarı özü verməli, riski özü qiymətləndirməlidir.",
    bullets: ["Minimal istiqamətləndirmə", "Daha yüksək xal dəyəri", "Bilikləri birləşdirmə tələbi"],
    accent: "red" as const,
  },
  {
    icon: Radar,
    name: "Analiz ssenarisi",
    tagline: "Real materialla iş",
    text: "Log analizi, phishing e-poçtunun araşdırılması, şübhəli davranışın tanınması — sintetik, lakin real həyatdan götürülmüş nümunələr üzərində.",
    bullets: ["Log sətirlərinin oxunması", "Phishing əlamətlərinin tapılması", "Şübhəli davranışın tanınması"],
    accent: "green" as const,
  },
];

export function RoomTypes() {
  return (
    <section id="room-tipleri" className="scroll-mt-24 pt-14 lg:pt-20" aria-labelledby="types-heading">
      <div className="max-w-2xl">
        <p className="section-kicker">Room tipləri</p>
        <h2 id="types-heading" className="section-title">
          Hər mərhələ üçün başqa məşq formatı
        </h2>
        <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
          Bir tip bütün şagirdə uyğun gəlmir. Ona görə Room-lar üç formatda qurulub: öyrənmə,
          möhkəmləndirmə və analiz.
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {TYPES.map((type) => {
          const Icon = type.icon;
          const green = type.accent === "green";

          return (
            <article
              key={type.name}
              className={`interactive-card relative overflow-hidden rounded-2xl border p-5 transition-all duration-500 sm:p-6 ${
                green ? "border-emerald-300/12 bg-[#1a1d1f]" : "border-red-300/12 bg-[#1a1d1f]"
              }`}
            >
              <div className={`card-radar card-radar--${type.accent}`} aria-hidden="true" />
              <div className="card-scanline" aria-hidden="true" />

              <div className="relative">
                <span className={`room-icon-shell room-icon-shell--${type.accent}`}>
                  <span className="room-icon-shell__ring" aria-hidden="true" />
                  <Icon className="size-5" aria-hidden="true" />
                </span>

                <h3 className="mt-4 text-lg font-semibold tracking-[-0.03em] text-white">{type.name}</h3>
                <p
                  className={`mt-1 font-mono text-[10px] uppercase tracking-[0.15em] ${
                    green ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {type.tagline}
                </p>
                <p className="mt-3 text-[13px] leading-6 text-slate-500">{type.text}</p>

                <ul className="mt-4 space-y-2 border-t border-white/[0.055] pt-4">
                  {type.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5 text-[12px] leading-5 text-slate-400">
                      <span
                        className={`mt-[6px] size-1.5 shrink-0 rounded-full ${
                          green ? "bg-emerald-400" : "bg-red-400"
                        }`}
                        aria-hidden="true"
                      />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
