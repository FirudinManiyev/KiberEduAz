import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock3, LogOut, ShieldAlert } from "lucide-react";
import { apiFetchOrNull } from "@/lib/api/server";
import type { MyProfile } from "@/lib/api/types";
import { homePathFor } from "@/lib/auth/home-path";

export const metadata: Metadata = {
  title: "Təsdiq gözlənilir",
  robots: { index: false, follow: false },
};

export default async function PendingPage() {
  const profile = await apiFetchOrNull<MyProfile>("/profiles/me");

  if (!profile) redirect("/login?next=/pending");

  if (!(profile.role === "TEACHER" && profile.accountStatus !== "ACTIVE")) {
    redirect(homePathFor(profile));
  }

  const rejected = profile.accountStatus === "REJECTED";

  return (
    <main className="relative flex flex-1 items-center justify-center px-4 py-16">
      <div className="hero-glow absolute inset-0 -z-10" />
      <div className="cyber-grid absolute inset-0 -z-10 opacity-[0.12]" />

      <section className="w-full max-w-lg rounded-2xl border border-red-300/10 bg-[#1a1d20]/90 p-8 text-center shadow-2xl backdrop-blur">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-amber-300">
          {rejected ? <ShieldAlert className="size-6" /> : <Clock3 className="size-6" />}
        </span>
        <p className="section-kicker mt-6">Müəllim müraciəti</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
          {rejected ? "Müraciət rədd edilib" : "Admin təsdiqi gözlənilir"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          {rejected
            ? "Admin müraciətini qəbul etməyib. Əlaqə saxla və ya yeni məlumatlarla yenidən müraciət et."
            : `${profile.institutionName ?? "Müəssisən"} üzrə müəllim hesabın yaradılıb. Admin təsdiq verənə qədər panel və Room yaratmaq bağlıdır.`}
        </p>
        <p className="mt-4 font-mono text-xs text-slate-600">{profile.email}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/contact" className="secondary-action justify-center">
            Əlaqə
          </Link>
          <form action="/auth/signout" method="post">
            <button type="submit" className="primary-action w-full justify-center sm:w-auto">
              <LogOut className="size-4" />
              Çıxış
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
