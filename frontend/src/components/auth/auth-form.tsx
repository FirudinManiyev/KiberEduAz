"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Loader2,
  Lock,
  Mail,
  UserRound,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/logo";
import { apiRequest } from "@/lib/api/client";
import type { MyProfile } from "@/lib/api/types";
import { authPendingLabel, type AuthMode } from "@/lib/auth/copy";
import { homePathFor } from "@/lib/auth/home-path";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const COPY = {
  login: {
    kicker: "Sistemə giriş",
    title: "Yenidən xoş gəldin",
    lead: "Missiyalarına davam etmək üçün hesabına daxil ol.",
    submit: "Daxil ol",
    switchText: "Hesabın yoxdur?",
    switchLabel: "Qeydiyyatdan keç",
    switchHref: "/register",
  },
  register: {
    kicker: "Yeni hesab",
    title: "Kiber yoluna başla",
    lead: "Bir neçə saniyəyə hesab yarat və ilk Room-unu aç.",
    submit: "Hesab yarat",
    switchText: "Artıq hesabın var?",
    switchLabel: "Daxil ol",
    switchHref: "/login",
  },
  "register-teacher": {
    kicker: "Müəllim qeydiyyatı",
    title: "Təlimçi hesabı yarat",
    lead: "Qeydiyyatdan sonra admin təsdiqi gözləyəcəksən. Təsdiq olmadan panel açılmır.",
    submit: "Müəllim kimi qeydiyyat",
    switchText: "Artıq hesabın var?",
    switchLabel: "Daxil ol",
    switchHref: "/login",
  },
} as const;

export function AuthForm({ mode }: { mode: AuthMode }) {
  const copy = COPY[mode];
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const nextPath =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : null;
  const switchHref = nextPath
    ? `${copy.switchHref}?next=${encodeURIComponent(nextPath)}`
    : copy.switchHref;

  // /auth/callback bounces a rejected confirmation link back here with the reason.
  const linkError = searchParams.get("authError");

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const shownError = error ?? (linkError ? translateLinkError(linkError) : null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const fullName = String(form.get("fullName") ?? "").trim();
    const institutionName = String(form.get("institutionName") ?? "").trim();
    const toastId = "auth-submit";

    toast.loading(mode === "login" ? "Hesaba daxil olunur…" : "Hesab yaradılır…", {
      id: toastId,
    });

    try {
      const supabase = createSupabaseBrowserClient();

      if (mode === "register" || mode === "register-teacher") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback${
              nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""
            }`,
            data: {
              full_name: fullName,
              ...(mode === "register-teacher"
                ? { pending_teacher: true, institution_name: institutionName }
                : {}),
            },
          },
        });

        if (signUpError) throw signUpError;

        if (!data.session) {
          const noticeMessage =
            mode === "register-teacher"
              ? "Təsdiq linki e-poçtuna göndərildi. Təsdiqdən sonra daxil ol — müəllim müraciətin adminə gedəcək."
              : "Təsdiq linki e-poçtuna göndərildi. Linki açdıqdan sonra daxil ola bilərsən.";
          setNotice(noticeMessage);
          toast.success("Təsdiq linki göndərildi", {
            id: toastId,
            description: "Davam etmək üçün e-poçt qutunu yoxla.",
          });
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

        if (signInError) throw signInError;
      }

      let profile = await apiRequest<MyProfile>("/profiles/me");

      // Teacher signup may complete after email confirmation; finish the
      // pending application from user_metadata on first authenticated request.
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const meta = user?.user_metadata as
        | { pending_teacher?: boolean; institution_name?: string }
        | undefined;

      if (
        (mode === "register-teacher" || meta?.pending_teacher) &&
        profile.role === "STUDENT"
      ) {
        profile = await apiRequest<MyProfile>("/profiles/me/request-teacher", {
          method: "POST",
          body: JSON.stringify({
            institutionName:
              institutionName || meta?.institution_name || "Müəssisə göstərilməyib",
          }),
        });

        await supabase.auth.updateUser({
          data: { pending_teacher: false },
        });
      }

      const roleHome = homePathFor(profile);
      const safeNext = nextPath && nextPath !== "/" ? nextPath : roleHome;

      router.replace(
        profile.role === "TEACHER" && profile.accountStatus !== "ACTIVE" ? "/pending" : safeNext,
      );
      toast.success(mode === "login" ? "Hesaba daxil oldun" : "Hesab yaradıldı", {
        id: toastId,
        description: "Şəxsi panelin hazırlanır.",
      });
      router.refresh();
    } catch (cause) {
      const message = translateAuthError(cause);
      setError(message);
      toast.error(message, { id: toastId });
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-4 py-12">
      <div className="hero-glow absolute inset-0 -z-10" />
      <div className="cyber-grid absolute inset-0 -z-10 opacity-[0.14]" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-2xl border border-red-300/10 bg-[#1a1d20]/90 p-6 shadow-[0_30px_100px_rgba(0,0,0,.35)] backdrop-blur sm:p-8">
          <p className="section-kicker">{copy.kicker}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
            {copy.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{copy.lead}</p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            {(mode === "register" || mode === "register-teacher") && (
              <Field
                icon={<UserRound className="size-4" aria-hidden="true" />}
                label="Ad və soyad"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Aylin Nəcəfova"
                required
              />
            )}

            {mode === "register-teacher" && (
              <Field
                icon={<Building2 className="size-4" aria-hidden="true" />}
                label="Məktəb / kollec"
                name="institutionName"
                type="text"
                autoComplete="organization"
                placeholder="Bakı Texniki Kolleci"
                required
              />
            )}

            <Field
              icon={<Mail className="size-4" aria-hidden="true" />}
              label="E-poçt"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="ad@mekteb.edu.az"
              required
            />

            <Field
              icon={<Lock className="size-4" aria-hidden="true" />}
              label="Şifrə"
              name="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="••••••••"
              minLength={8}
              required
            />

            {shownError && (
              <p
                className="flex items-start gap-2 rounded-xl border border-rose-300/20 bg-rose-300/[0.07] p-3 text-xs leading-5 text-rose-100"
                role="alert"
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {shownError}
              </p>
            )}

            {notice && (
              <p
                className="rounded-xl border border-emerald-300/20 bg-emerald-300/[0.07] p-3 text-xs leading-5 text-emerald-100"
                role="status"
              >
                {notice}
              </p>
            )}

            <button type="submit" disabled={pending} className="primary-action group w-full disabled:opacity-60" aria-live="polite">
              <span className="relative z-10">{pending ? authPendingLabel(mode) : copy.submit}</span>
              <span className="relative z-10">
                {pending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                )}
              </span>
              <span className="button-sheen" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-600">
            {copy.switchText}{" "}
            <Link href={switchHref} className="font-semibold text-emerald-300 hover:underline">
              {copy.switchLabel}
            </Link>
          </p>

          {mode === "register" && (
            <p className="mt-3 text-center text-xs text-slate-600">
              Müəllimsən?{" "}
              <Link href="/register/teacher" className="font-semibold text-red-300 hover:underline">
                Müəllim kimi qeydiyyat
              </Link>
            </p>
          )}

          {mode === "register-teacher" && (
            <p className="mt-3 text-center text-xs text-slate-600">
              Şagird hesabı üçün{" "}
              <Link href="/register" className="font-semibold text-emerald-300 hover:underline">
                adi qeydiyyat
              </Link>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({
  icon,
  label,
  ...props
}: { icon: React.ReactNode; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-400">{label}</span>
      <span className="relative mt-2 block">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
          {icon}
        </span>
        <input
          {...props}
          className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/20 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-emerald-300/35 focus:ring-2 focus:ring-emerald-300/10"
        />
      </span>
    </label>
  );
}

function translateAuthError(cause: unknown): string {
  const message = cause instanceof Error ? cause.message : String(cause);

  if (/invalid login credentials/i.test(message)) return "E-poçt və ya şifrə yanlışdır.";
  if (/already registered|already been registered/i.test(message)) return "Bu e-poçt artıq qeydiyyatdadır.";
  if (/password should be at least/i.test(message)) return "Şifrə ən azı 8 simvol olmalıdır.";
  if (/email not confirmed/i.test(message)) return "E-poçtunu təsdiqləməmisən. Gələn qutunu yoxla.";
  if (/rate limit|too many/i.test(message)) return "Çox sayda cəhd. Bir az gözlə və yenidən yoxla.";

  return message || "Gözlənilməz xəta baş verdi.";
}

/// Reasons /auth/callback can reject a confirmation link. Supabase words these in
/// English on the query string, so map the common ones before showing them.
function translateLinkError(reason: string): string {
  if (reason === "missing-code") {
    return "Təsdiq linki natamamdır. Aşağıdan yenidən daxil olmağa çalış.";
  }
  if (/expired/i.test(reason)) {
    return "Təsdiq linkinin vaxtı bitib. Yenidən qeydiyyatdan keçib yeni link istə.";
  }
  if (/already|used/i.test(reason)) {
    return "Bu link artıq istifadə olunub. Sadəcə daxil ol.";
  }

  return `Təsdiq alınmadı: ${reason}`;
}
