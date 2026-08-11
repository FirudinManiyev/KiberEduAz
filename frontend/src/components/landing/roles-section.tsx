import { GraduationCap, Presentation, School } from "lucide-react";

const ROLES = [
  {
    icon: GraduationCap,
    name: "Şagird",
    lead: "Öyrənən tərəf",
    items: [
      "Room-ları öz sürəti ilə keçir",
      "Cavabına dərhal izahlı geri bildirim alır",
      "Xal, rütbə və seriya ilə irəliləyişini görür",
      "Path tamamlayanda sertifikat qazanır",
    ],
    accent: "green" as const,
  },
  {
    icon: Presentation,
    name: "Müəllim / təlimçi",
    lead: "Təlimi quran tərəf",
    items: [
      "Path, Module, Room və Task strukturunu idarə edir",
      "Məzmunu qaralama saxlayıb hazır olanda dərc edir",
      "Sinfin hansı mövzuda çətinlik çəkdiyini görür",
      "Tapşırığı sinfə bir link kimi verir",
    ],
    accent: "red" as const,
  },
  {
    icon: School,
    name: "Məktəb admini",
    lead: "Təşkil edən tərəf",
    items: [
      "Sinifləri və istifadəçi rollarını qurur",
      "Müəssisə üzrə ümumi mənzərəyə baxır",
      "Təlimi rəsmi tədris planına bağlayır",
      "Pilot mərhələni komanda ilə birgə planlaşdırır",
    ],
    accent: "green" as const,
  },
];

export function RolesSection() {
  return (
    <section id="rollar" className="scroll-mt-24 pt-14 lg:pt-20" aria-labelledby="roles-heading">
      <div className="max-w-2xl">
        <p className="section-kicker section-kicker--red">Üç rol</p>
        <h2 id="roles-heading" className="section-title">
          Platforma yalnız şagird üçün deyil
        </h2>
        <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
          Təlimin işləməsi üçün üç tərəf lazımdır. Hər rolun öz iş sahəsi və öz görünüşü var.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ROLES.map((role) => {
          const Icon = role.icon;
          const green = role.accent === "green";

          return (
            <article
              key={role.name}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.075] bg-linear-to-br from-[#1b1e20] to-[#17191b] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.14] hover:shadow-[0_18px_50px_rgba(0,0,0,.2)] sm:p-6"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`grid size-11 shrink-0 place-items-center rounded-xl border transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105 ${
                    green
                      ? "border-emerald-300/18 bg-emerald-300/[0.07] text-emerald-300"
                      : "border-red-300/18 bg-red-300/[0.07] text-red-300"
                  }`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-white">{role.name}</h3>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-600">
                    {role.lead}
                  </p>
                </div>
              </div>

              <ul className="mt-5 space-y-2.5 border-t border-white/[0.055] pt-5">
                {role.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[12px] leading-5 text-slate-400">
                    <span
                      className={`mt-[6px] size-1.5 shrink-0 rounded-full ${
                        green ? "bg-emerald-400" : "bg-red-400"
                      }`}
                      aria-hidden="true"
                    />
                    {item}
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
