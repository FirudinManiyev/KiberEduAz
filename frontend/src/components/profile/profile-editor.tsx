"use client";

import { Check, Save, ShieldCheck, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";

const avatars = [
  { initials: "AN", className: "from-red-500 to-red-950" },
  { initials: "AX", className: "from-emerald-400 to-emerald-950" },
  { initials: "01", className: "from-zinc-400 to-zinc-900" },
  { initials: "KZ", className: "from-amber-400 to-red-900" },
];

function Toggle({ label, description, initial = true }: { label: string; description: string; initial?: boolean }) {
  const [enabled, setEnabled] = useState(initial);

  return (
    <button type="button" onClick={() => setEnabled((value) => !value)} className="group flex w-full items-center gap-4 rounded-xl border border-white/[0.065] bg-black/15 p-4 text-left transition-all hover:translate-x-1 hover:border-white/[0.12] hover:bg-white/[0.025]" aria-pressed={enabled}>
      <span className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${enabled ? "border-emerald-300/25 bg-emerald-400/20" : "border-white/[0.08] bg-white/[0.04]"}`}>
        <span className={`absolute top-1 size-3.5 rounded-full transition-all ${enabled ? "left-[22px] bg-emerald-300 shadow-[0_0_8px_rgba(52,211,153,.5)]" : "left-1 bg-slate-600"}`} />
      </span>
      <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-200">{label}</span><span className="mt-1 block text-[11px] leading-4 text-slate-600">{description}</span></span>
      <span className={`text-[9px] font-bold uppercase tracking-wider ${enabled ? "text-emerald-400" : "text-slate-700"}`}>{enabled ? "Aktiv" : "Sönülü"}</span>
    </button>
  );
}

export function ProfileEditor() {
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_350px]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-red-300/10 bg-[#1a1d1f] p-5 sm:p-7">
          <div className="flex items-center gap-3 border-b border-white/[0.06] pb-5"><span className="grid size-9 place-items-center rounded-xl border border-red-300/15 bg-red-300/[0.06] text-red-300"><Sparkles className="size-4" /></span><div><h2 className="text-base font-semibold text-white">Şəxsi məlumatlar</h2><p className="mt-0.5 text-[11px] text-slate-600">Platformada görünən profil məlumatların</p></div></div>

          <div className="mt-6">
            <label className="text-xs font-semibold text-slate-400">Avatar seç</label>
            <div className="mt-3 flex flex-wrap gap-3">
              {avatars.map((avatar, index) => (
                <button key={`${avatar.initials}-${index}`} type="button" onClick={() => setSelectedAvatar(index)} className={`relative grid size-14 place-items-center rounded-2xl border bg-gradient-to-br text-sm font-bold text-white transition-all hover:-translate-y-1 hover:rotate-2 ${avatar.className} ${selectedAvatar === index ? "border-emerald-300/60 shadow-[0_0_24px_rgba(52,211,153,.12)]" : "border-white/[0.08]"}`} aria-label={`Avatar ${index + 1}`}>
                  {avatar.initials}
                  {selectedAvatar === index && <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-emerald-400 text-emerald-950 ring-2 ring-[#1a1d1f]"><Check className="size-3" strokeWidth={3} /></span>}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <label className="profile-field"><span>Ad və soyad</span><input defaultValue="Aylin Nəcəfova" /></label>
            <label className="profile-field"><span>İstifadəçi adı</span><input defaultValue="aylin.cyber" /></label>
            <label className="profile-field"><span>Təhsil müəssisəsi</span><input defaultValue="Bakı Texniki Kolleci" /></label>
            <label className="profile-field"><span>Sinif / qrup</span><input defaultValue="11A · Kiber klub" /></label>
            <label className="profile-field sm:col-span-2"><span>Haqqımda</span><textarea rows={4} defaultValue="Kibertəhlükəsizlik, log analizi və müdafiə yönümlü texnologiyalarla maraqlanıram." /></label>
          </div>
        </section>

        <section className="rounded-2xl border border-red-300/10 bg-[#1a1d1f] p-5 sm:p-7">
          <h2 className="text-base font-semibold text-white">Təlim seçimləri</h2>
          <p className="mt-1 text-[11px] text-slate-600">Sənə göstərilən missiyaları fərdiləşdir</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="profile-field"><span>Əsas istiqamət</span><select defaultValue="defense"><option value="defense">Müdafiə / Blue Team</option><option value="offense">Hücum / Red Team</option><option value="grc">GRC</option></select></label>
            <label className="profile-field"><span>Həftəlik hədəf</span><select defaultValue="5"><option value="3">3 task</option><option value="5">5 task</option><option value="10">10 task</option></select></label>
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="profile-rank-card relative overflow-hidden rounded-2xl border border-emerald-300/12 p-6">
          <div className="cyber-grid absolute inset-0 opacity-[0.12]" />
          <div className="relative"><div className="flex items-center justify-between"><span className="grid size-12 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-300"><ShieldCheck className="size-6" /></span><span className="rounded-full border border-white/[0.07] bg-black/20 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">Səviyyə 04</span></div><p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-400">Cari rütbə</p><h2 className="mt-1 text-2xl font-semibold text-white">Öyrənən</h2><p className="mt-2 text-xs leading-5 text-slate-500">Bacarıqlı rütbəsinə 760 XP qalıb.</p><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full w-[62%] rounded-full bg-gradient-to-r from-red-500 to-emerald-400" /></div><div className="mt-2 flex justify-between font-mono text-[9px] text-slate-600"><span>1,240 XP</span><span>2,000 XP</span></div></div>
        </section>

        <section className="rounded-2xl border border-red-300/10 bg-[#1a1d1f] p-5">
          <h2 className="text-sm font-semibold text-white">Bildiriş seçimləri</h2>
          <div className="mt-4 space-y-2.5"><Toggle label="Yeni Room-lar" description="Yeni təlim yayımlananda xəbər al" /><Toggle label="Seriya xatırlatması" description="Gündəlik seriyanı itirməzdən əvvəl xatırlat" /><Toggle label="Sinif reytinqi" description="Sıralamadakı dəyişiklikləri göstər" initial={false} /></div>
        </section>

        <button type="submit" className="primary-action w-full"><Save className="size-4" />Dəyişiklikləri saxla<span className="button-sheen" /></button>
        <p className="text-center text-[10px] leading-4 text-slate-700">MVP demo profilidir. Dəyişikliklər backend qoşulana qədər daimi saxlanmır.</p>
      </aside>

      {saved && <div className="save-toast" role="status"><span className="grid size-8 place-items-center rounded-lg bg-emerald-400 text-emerald-950"><Check className="size-4" strokeWidth={3} /></span><div><p className="text-xs font-semibold text-white">Profil yeniləndi</p><p className="mt-0.5 text-[10px] text-slate-500">Demo dəyişikliklər tətbiq olundu.</p></div></div>}
    </form>
  );
}
