import { Boxes, CircleHelp, DoorOpen, ListChecks, Route } from "lucide-react";

const LEVELS = [
  {
    icon: Route,
    name: "Path",
    text: "Bütöv təlim istiqaməti — məsələn kiber gigiyena və ya təhdid analizi başlanğıcı.",
  },
  {
    icon: Boxes,
    name: "Module",
    text: "Path-in daxilindəki mövzu blokları. Sinif üçün bir tədris bölməsinə uyğun gəlir.",
  },
  {
    icon: DoorOpen,
    name: "Room",
    text: "Bir dərs sessiyası. Tipi, çətinlik səviyyəsi, təxmini müddəti və xal dəyəri var.",
  },
  {
    icon: ListChecks,
    name: "Task",
    text: "Room-un addımı: nəzəri hissə plus həmin hissəyə bağlı praktik yoxlama.",
  },
  {
    icon: CircleHelp,
    name: "Sual",
    text: "Ən kiçik vahid — seçim, doğru/yanlış və ya qısa cavab. Xal buradan gəlir.",
  },
];

export function ContentStructure() {
  return (
    <section id="struktur" className="scroll-mt-24 pt-14 lg:pt-20" aria-labelledby="structure-heading">
      <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <p className="section-kicker section-kicker--red">Məzmun arxitekturası</p>
          <h2 id="structure-heading" className="section-title">
            Beş səviyyəli aydın iyerarxiya
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
            Müəllim təlimi bölmələrə ayırır, şagird isə hansı mərhələdə olduğunu itirmir. Hər
            səviyyənin öz irəliləyiş göstəricisi var, ona görə də yarımçıq qalan yerə qayıtmaq
            asandır.
          </p>
        </div>

        <ol className="relative space-y-3">
          <div className="road-line absolute bottom-8 left-[26px] top-8 w-px" aria-hidden="true" />
          {LEVELS.map((level, index) => {
            const Icon = level.icon;

            return (
              <li
                key={level.name}
                className="relative flex items-start gap-4 rounded-xl border border-white/[0.065] bg-white/[0.02] p-4 transition-all hover:translate-x-1 hover:border-emerald-300/20 hover:bg-emerald-300/[0.03] sm:p-5"
              >
                <span
                  className={`relative z-10 grid size-[38px] shrink-0 place-items-center rounded-xl border ${
                    index % 2 === 0
                      ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-300"
                      : "border-red-300/25 bg-red-300/10 text-red-300"
                  }`}
                >
                  <Icon className="size-[17px]" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-white">{level.name}</span>
                    <span className="font-mono text-[10px] text-slate-700">
                      L{index + 1}
                    </span>
                  </p>
                  <p className="mt-1.5 text-[12px] leading-5 text-slate-500">{level.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
