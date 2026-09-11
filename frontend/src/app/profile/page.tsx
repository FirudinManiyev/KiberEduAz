import type { Metadata } from "next";
import { Award, Flame, Target } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { DeleteAccount } from "@/components/profile/delete-account";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { apiFetch } from "@/lib/api/server";
import type { MyProfile, ProgressSummary } from "@/lib/api/types";

export const metadata: Metadata = { title: "Profil", description: "KiberEduAz öyrənən profili və təlim seçimləri." };

export default async function ProfilePage() {
  const [profile, summary] = await Promise.all([
    apiFetch<MyProfile>("/profiles/me"),
    apiFetch<ProgressSummary>("/progress/summary"),
  ]);

  const badges = [
    { icon: Flame, value: `${summary.currentStreak} gün`, label: "seriya" },
    { icon: Target, value: `${summary.accuracy}%`, label: "dəqiqlik" },
    { icon: Award, value: String(summary.roomsCompleted), label: "tamamlanan Room" },
  ];

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden border-b border-white/[0.06]"><div className="room-glow-red absolute inset-0 -z-10" /><div className="cyber-grid absolute inset-0 -z-10 opacity-[0.12]" /><div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14"><div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="section-kicker section-kicker--red">Şəxsi mərkəz</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">Profilini idarə et</h1><p className="mt-4 max-w-xl text-sm leading-6 text-slate-500">Kiber kimliyini, hədəflərini və bildiriş seçimlərini fərdiləşdir.</p></div><div className="flex flex-wrap items-center gap-2">{badges.map((item)=>{const Icon=item.icon;return <div key={item.label} className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/20 px-3 py-2"><Icon className="size-3.5 text-emerald-400" /><span className="text-xs font-semibold text-white">{item.value}</span><span className="text-[10px] text-slate-600">{item.label}</span></div>})}<SignOutButton /></div></div></div></section>
      <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14"><ProfileEditor profile={profile} rank={summary.rank} /></section>
      <section className="mx-auto max-w-[1440px] px-4 pb-14 sm:px-6 lg:px-10"><div className="lg:max-w-[calc(100%-374px)]"><DeleteAccount /></div></section>
    </main>
  );
}
