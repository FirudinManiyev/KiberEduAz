"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Loader2, Save, ShieldCheck, Sparkles } from "lucide-react";
import { FormEvent, useState, useTransition } from "react";
import { apiRequest } from "@/lib/api/client";
import type { MyProfile, Rank } from "@/lib/api/types";

const AVATARS = [
  { key: "red", initials: "AN", className: "from-red-500 to-red-950", image: "/images/userprofile.jpg" },
  { key: "emerald", initials: "AX", className: "from-emerald-400 to-emerald-950", image: "/images/teacher_profile_photo.png" },
  { key: "zinc", initials: "01", className: "from-zinc-400 to-zinc-900", image: null },
  { key: "amber", initials: "KZ", className: "from-amber-400 to-red-900", image: null },
];

const FOCUS_TRACKS = [
  { value: "defense", label: "Müdafiə / Blue Team" },
  { value: "offense", label: "Hücum / Red Team" },
  { value: "grc", label: "GRC" },
];

type ProfileEditorProps = {
  profile: MyProfile;
  rank: Rank;
};

function Toggle({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button type="button" onClick={() => onChange(!enabled)} className="group flex w-full items-center gap-4 rounded-xl border border-white/[0.065] bg-black/15 p-4 text-left transition-all hover:translate-x-1 hover:border-white/[0.12] hover:bg-white/[0.025]" aria-pressed={enabled}>
      <span className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${enabled ? "border-emerald-300/25 bg-emerald-400/20" : "border-white/[0.08] bg-white/[0.04]"}`}>
        <span className={`absolute top-1 size-3.5 rounded-full transition-all ${enabled ? "left-[22px] bg-emerald-300 shadow-[0_0_8px_rgba(52,211,153,.5)]" : "left-1 bg-slate-600"}`} />
      </span>
      <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-200">{label}</span><span className="mt-1 block text-[11px] leading-4 text-slate-600">{description}</span></span>
      <span className={`text-[9px] font-bold uppercase tracking-wider ${enabled ? "text-emerald-400" : "text-slate-700"}`}>{enabled ? "Aktiv" : "Sönülü"}</span>
    </button>
  );
}

export function ProfileEditor({ profile, rank }: ProfileEditorProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [avatarKey, setAvatarKey] = useState(profile.avatarKey ?? AVATARS[0].key);
  const [notifications, setNotifications] = useState(profile.notifications);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    const form = new FormData(event.currentTarget);
    const text = (name: string) => {
      const value = String(form.get(name) ?? "").trim();
      return value.length > 0 ? value : undefined;
    };

    try {
      await apiRequest<MyProfile>("/profiles/me", {
        method: "PATCH",
        body: JSON.stringify({
          fullName: text("fullName"),
          username: text("username"),
          institutionName: text("institutionName"),
          classLabel: text("classLabel"),
          bio: text("bio"),
          focusTrack: text("focusTrack"),
          weeklyGoal: Number(form.get("weeklyGoal") ?? profile.weeklyGoal),
          avatarKey,
          notifyNewRooms: notifications.newRooms,
          notifyStreak: notifications.streak,
          notifyLeaderboard: notifications.leaderboard,
        }),
      });

      setSaved(true);
      window.setTimeout(() => setSaved(false), 2600);
      startTransition(() => router.refresh());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Profil saxlanıla bilmədi");
    } finally {
      setSaving(false);
    }
  }

  const remaining = rank.nextThreshold ? Math.max(0, rank.nextThreshold - rank.currentPoints) : 0;

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_350px]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-red-300/10 bg-[#1a1d1f] p-5 sm:p-7">
          <div className="flex items-center gap-3 border-b border-white/[0.06] pb-5"><span className="grid size-9 place-items-center rounded-xl border border-red-300/15 bg-red-300/[0.06] text-red-300"><Sparkles className="size-4" /></span><div><h2 className="text-base font-semibold text-white">Şəxsi məlumatlar</h2><p className="mt-0.5 text-[11px] text-slate-600">{profile.email}</p></div></div>

          <div className="mt-6">
            <span className="text-xs font-semibold text-slate-400">Avatar seç</span>
            <div className="mt-3 flex flex-wrap gap-3">
              {AVATARS.map((avatar) => (
                <button key={avatar.key} type="button" onClick={() => setAvatarKey(avatar.key)} className={`relative grid size-14 place-items-center overflow-hidden rounded-2xl border bg-gradient-to-br text-sm font-bold text-white transition-all hover:-translate-y-1 hover:rotate-2 ${avatar.className} ${avatarKey === avatar.key ? "border-emerald-300/60 shadow-[0_0_24px_rgba(52,211,153,.12)]" : "border-white/[0.08]"}`} aria-label={`Avatar ${avatar.key}`} aria-pressed={avatarKey === avatar.key}>
                  {avatar.image ? <Image src={avatar.image} alt="" fill sizes="56px" className="object-cover" aria-hidden="true" /> : avatar.initials}
                  {avatarKey === avatar.key && <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-emerald-400 text-emerald-950 ring-2 ring-[#1a1d1f]"><Check className="size-3" strokeWidth={3} /></span>}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <label className="profile-field"><span>Ad və soyad</span><input name="fullName" defaultValue={profile.fullName ?? ""} maxLength={120} /></label>
            <label className="profile-field"><span>İstifadəçi adı</span><input name="username" defaultValue={profile.username ?? ""} pattern="[a-z0-9._\-]{3,32}" title="3-32 simvol: kiçik hərf, rəqəm, nöqtə, tire" /></label>
            <label className="profile-field"><span>Təhsil müəssisəsi</span><input name="institutionName" defaultValue={profile.institutionName ?? ""} maxLength={160} /></label>
            <label className="profile-field"><span>Sinif / qrup</span><input name="classLabel" defaultValue={profile.classLabel ?? ""} maxLength={80} /></label>
            <label className="profile-field sm:col-span-2"><span>Haqqımda</span><textarea name="bio" rows={4} maxLength={600} defaultValue={profile.bio ?? ""} /></label>
          </div>
        </section>

        <section className="rounded-2xl border border-red-300/10 bg-[#1a1d1f] p-5 sm:p-7">
          <h2 className="text-base font-semibold text-white">Təlim seçimləri</h2>
          <p className="mt-1 text-[11px] text-slate-600">Sənə göstərilən missiyaları fərdiləşdir</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="profile-field"><span>Əsas istiqamət</span><select name="focusTrack" defaultValue={profile.focusTrack ?? "defense"}>{FOCUS_TRACKS.map((track) => <option key={track.value} value={track.value}>{track.label}</option>)}</select></label>
            <label className="profile-field"><span>Həftəlik hədəf</span><select name="weeklyGoal" defaultValue={String(profile.weeklyGoal)}><option value="3">3 task</option><option value="5">5 task</option><option value="10">10 task</option></select></label>
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="profile-rank-card relative overflow-hidden rounded-2xl border border-emerald-300/12 p-6">
          <div className="cyber-grid absolute inset-0 opacity-[0.12]" />
          <div className="relative"><div className="flex items-center justify-between"><span className="grid size-12 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-300"><ShieldCheck className="size-6" /></span><span className="rounded-full border border-white/[0.07] bg-black/20 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">Səviyyə {String(rank.level).padStart(2, "0")}</span></div><p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-400">Cari rütbə</p><h2 className="mt-1 text-2xl font-semibold text-white">{rank.name}</h2><p className="mt-2 text-xs leading-5 text-slate-500">{rank.nextThreshold ? `Növbəti rütbəyə ${remaining.toLocaleString("az-AZ")} XP qalıb.` : "Ən yüksək rütbədəsən."}</p><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-gradient-to-r from-red-500 to-emerald-400" style={{ width: `${rank.percent}%` }} /></div><div className="mt-2 flex justify-between font-mono text-[9px] text-slate-600"><span>{rank.currentPoints.toLocaleString("az-AZ")} XP</span><span>{rank.nextThreshold ? `${rank.nextThreshold.toLocaleString("az-AZ")} XP` : "MAX"}</span></div></div>
        </section>

        <section className="rounded-2xl border border-red-300/10 bg-[#1a1d1f] p-5">
          <h2 className="text-sm font-semibold text-white">Bildiriş seçimləri</h2>
          <div className="mt-4 space-y-2.5">
            <Toggle label="Yeni Room-lar" description="Yeni təlim yayımlananda xəbər al" enabled={notifications.newRooms} onChange={(value) => setNotifications((current) => ({ ...current, newRooms: value }))} />
            <Toggle label="Seriya xatırlatması" description="Gündəlik seriyanı itirməzdən əvvəl xatırlat" enabled={notifications.streak} onChange={(value) => setNotifications((current) => ({ ...current, streak: value }))} />
            <Toggle label="Sinif reytinqi" description="Sıralamadakı dəyişiklikləri göstər" enabled={notifications.leaderboard} onChange={(value) => setNotifications((current) => ({ ...current, leaderboard: value }))} />
          </div>
        </section>

        {error && (
          <p className="flex items-start gap-2 rounded-xl border border-rose-300/20 bg-rose-300/[0.07] p-3 text-xs leading-5 text-rose-100" role="alert">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}

        <button type="submit" disabled={saving} className="primary-action w-full disabled:opacity-60">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Dəyişiklikləri saxla
          <span className="button-sheen" />
        </button>
      </aside>

      {saved && <div className="save-toast" role="status"><span className="grid size-8 place-items-center rounded-lg bg-emerald-400 text-emerald-950"><Check className="size-4" strokeWidth={3} /></span><div><p className="text-xs font-semibold text-white">Profil yeniləndi</p><p className="mt-0.5 text-[10px] text-slate-500">Dəyişikliklər bazaya yazıldı.</p></div></div>}
    </form>
  );
}
