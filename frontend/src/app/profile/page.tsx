import type { Metadata } from "next";
import { Award, Flame, Target } from "lucide-react";
import { ProfileEditor } from "@/components/profile/profile-editor";

export const metadata: Metadata = { title: "Profil", description: "KiberEduAz öyrənən profili və təlim seçimləri." };

export default function ProfilePage() {
  return (
    <main className="flex-1">
      <section className="relative overflow-hidden border-b border-white/[0.06]"><div className="room-glow-red absolute inset-0 -z-10" /><div className="cyber-grid absolute inset-0 -z-10 opacity-[0.12]" /><div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14"><div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="section-kicker section-kicker--red">Şəxsi mərkəz</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">Profilini idarə et</h1><p className="mt-4 max-w-xl text-sm leading-6 text-slate-500">Kiber kimliyini, hədəflərini və bildiriş seçimlərini fərdiləşdir.</p></div><div className="flex flex-wrap gap-2">{[{ icon: Flame, value: "7 gün", label: "seriya" },{ icon: Target, value: "87%", label: "dəqiqlik" },{ icon: Award, value: "3", label: "nişan" }].map((item)=>{const Icon=item.icon;return <div key={item.label} className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/20 px-3 py-2"><Icon className="size-3.5 text-emerald-400" /><span className="text-xs font-semibold text-white">{item.value}</span><span className="text-[10px] text-slate-600">{item.label}</span></div>})}</div></div></div></section>
      <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14"><ProfileEditor /></section>
    </main>
  );
}
