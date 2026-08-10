"use client";

import { Check, Send, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.currentTarget.reset();
    setSubmitted(true);
    window.setTimeout(() => setSubmitted(false), 3500);
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form relative overflow-hidden rounded-2xl border border-red-300/15 bg-[#1a1d1f]/95 p-5 shadow-[0_28px_90px_rgba(0,0,0,.25)] backdrop-blur-xl sm:p-7">
      <div className="card-radar card-radar--red" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.065] pb-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-red-400">Birbaşa mesaj</p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-white">Bizə yaz</h2>
            <p className="mt-2 text-xs leading-5 text-slate-500">Sorğunu qısa təsvir et, komanda uyğun istiqamətləndirməni hazırlasın.</p>
          </div>
          <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-300">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="profile-field">
            <span>Ad və soyad</span>
            <input name="name" autoComplete="name" placeholder="Adınızı daxil edin" required />
          </label>
          <label className="profile-field">
            <span>E-poçt</span>
            <input name="email" type="email" autoComplete="email" placeholder="name@example.com" required />
          </label>
          <label className="profile-field">
            <span>Müəssisə / məktəb</span>
            <input name="organization" autoComplete="organization" placeholder="Müəssisənin adı" />
          </label>
          <label className="profile-field">
            <span>Mövzu</span>
            <select name="topic" defaultValue="platform">
              <option value="platform">Platforma haqqında</option>
              <option value="school">Məktəb üçün əməkdaşlıq</option>
              <option value="content">Təlim məzmunu</option>
              <option value="technical">Texniki məsələ</option>
            </select>
          </label>
          <label className="profile-field sm:col-span-2">
            <span>Mesaj</span>
            <textarea name="message" rows={6} placeholder="Sualınızı və ya təklifinizi yazın..." required />
          </label>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] leading-4 text-slate-600">MVP formudur — məlumat serverə göndərilmir.</p>
          <button type="submit" className="primary-action group sm:min-w-40">
            Mesajı hazırla
            <Send className="size-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true" />
            <span className="button-sheen" />
          </button>
        </div>
      </div>

      {submitted && (
        <div className="save-toast" role="status">
          <span className="grid size-8 place-items-center rounded-lg bg-emerald-400 text-emerald-950">
            <Check className="size-4" strokeWidth={3} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold text-white">Mesaj forması hazırlandı</p>
            <p className="mt-0.5 text-[10px] text-slate-500">Backend qoşulduqdan sonra sorğu göndəriləcək.</p>
          </div>
        </div>
      )}
    </form>
  );
}
