"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
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
import { toUserErrorMessage } from "@/lib/errors/user-error";
import { ResendConfirmation } from "@/components/auth/resend-confirmation";
import { getAuthCallbackUrl, safeRelativePath } from "@/lib/site-url";
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
  const nextPath = safeRelativePath(nextParam);
  const switchHref = nextPath
    ? `${copy.switchHref}?next=${encodeURIComponent(nextPath)}`
    : copy.switchHref;

  // /auth/callback bounces a rejected confirmation link back here with the reason.
  const linkError = searchParams.get("authError");

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  // Set whenever the account exists but its address is not confirmed yet, so
  // the visitor is offered a new link instead of being told to wait.
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const shownError = error ?? (linkError ? translateLinkError(linkError) : null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setUnconfirmedEmail(null);
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
            // Pinned to NEXT_PUBLIC_SITE_URL: window.location.origin sends
            // the confirmation mail to whatever host the visitor signed up
            // from, which is how production mails ended up linking to
            // localhost.
            emailRedirectTo: getAuthCallbackUrl(nextPath),
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
          setUnconfirmedEmail(email);
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
      const raw = cause instanceof Error ? cause.message : String(cause);

      // Signing in before confirming is the other way to end up needing a new
      // link, and the only moment we can be sure the address is genuinely
      // registered but unconfirmed.
      if (/email not confirmed|confirm.*email/i.test(raw) && email) {
        setUnconfirmedEmail(email);
      }

      const message = toUserErrorMessage(
        cause,
        mode === "login" ? "Hesaba daxil olmaq mümkün olmadı" : "Hesab yaratmaq mümkün olmadı",
      );
      setError(message);
      toast.error(message, { id: toastId });
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-3 py-4 sm:px-5 sm:py-8">
      <div className="hero-glow absolute inset-0 -z-10" />
      <div className="cyber-grid absolute inset-0 -z-10 opacity-[0.14]" />

      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#171a1c]/95 shadow-[0_35px_120px_rgba(0,0,0,.42)] backdrop-blur-xl lg:grid-cols-[1.08fr_.92fr] lg:rounded-[2rem]">
        <aside
          aria-label="Kibertəhlükəsizlik öyrənmə vizualı"
          className="relative min-h-[245px] overflow-hidden border-b border-white/[0.07] bg-[#111719] lg:min-h-[620px] lg:border-b-0 lg:border-r"
        >
          <div className="cyber-grid absolute inset-0 opacity-[0.22]" aria-hidden="true" />
          <div
            className="absolute left-1/2 top-1/2 size-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/[0.09] blur-3xl lg:size-[560px]"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-32 -left-20 size-72 rounded-full bg-emerald-400/[0.08] blur-3xl"
            aria-hidden="true"
          />

          <div className="absolute inset-x-4 top-4 z-20 flex items-center justify-between gap-4 sm:inset-x-6 sm:top-6 lg:inset-x-8">
            <Logo />
            <Link
              href="/"
              prefetch
              aria-label="Ana səhifəyə qayıt"
              className="group inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/15 px-3 py-2 text-[11px] font-semibold text-slate-300 backdrop-blur transition-colors hover:border-emerald-300/25 hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <ArrowLeft
                className="size-3.5 transition-transform group-hover:-translate-x-1"
                aria-hidden="true"
              />
              Ana səhifə
            </Link>
          </div>

          <div
            data-auth-artwork-size="compact"
            className="absolute inset-x-9 bottom-3 top-16 sm:inset-x-16 sm:bottom-5 lg:inset-x-16 lg:bottom-24 lg:top-24 xl:inset-x-20"
          >
            <Image
              src="/login_reg_photo.png"
              alt=""
              fill
              preload
              sizes="(min-width: 1024px) 54vw, 100vw"
              className="object-contain drop-shadow-[0_28px_45px_rgba(0,0,0,.3)]"
            />
          </div>

          <div className="absolute inset-x-8 bottom-8 z-20 hidden lg:block">
            <div className="max-w-md rounded-2xl border border-white/[0.08] bg-black/20 p-4 backdrop-blur-md">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-300/75">
                Təhlükəsiz öyrənmə mühiti
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Kiber biliklərini addım-addım inkişaf etdir, praktik tapşırıqlarla möhkəmləndir.
              </p>
            </div>
          </div>
        </aside>

        <section className="flex items-center bg-linear-to-br from-[#1d2023] to-[#17191b] p-5 sm:p-8 lg:p-10 xl:p-12">
          <div className="mx-auto w-full max-w-md">
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

              {unconfirmedEmail && (
                <ResendConfirmation email={unconfirmedEmail} next={nextPath} />
              )}

              <button
                type="submit"
                disabled={pending}
                className="primary-action group w-full disabled:opacity-60"
                aria-live="polite"
              >
                <span className="relative z-10">{pending ? authPendingLabel(mode) : copy.submit}</span>
                <span className="relative z-10">
                  {pending ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  )}
                </span>
                <span className="button-sheen" />
              </button>
            </form>

            {mode === "login" && (
              <p className="mt-4 text-center text-xs text-slate-600">
                <Link href="/forgot-password" className="font-semibold text-slate-400 hover:text-emerald-300 hover:underline">
                  Parolunu unutmusan?
                </Link>
              </p>
            )}

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
        </section>
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

/// Reasons /auth/callback can reject a confirmation link. Supabase words these in
/// English on the query string, so map the common ones before showing them.
function translateLinkError(reason: string): string {
  if (reason === "missing-code") {
    return "Təsdiq linki natamamdır. Aşağıdan yenidən daxil olmağa çalış.";
  }
  if (reason === "expired-link" || /expired/i.test(reason)) {
    // A new link is one sign-in attempt away now, so send them there rather
    // than telling them to register again.
    return "Təsdiq linkinin vaxtı bitib. Aşağıda e-poçt və şifrəni yazıb daxil ol — yeni link göndərmə düyməsi görünəcək.";
  }
  if (reason === "used-link" || /already|used/i.test(reason)) {
    return "Bu link artıq istifadə olunub. Sadəcə daxil ol.";
  }

  return "E-poçt təsdiqlənə bilmədi. Yeni link istəyib yenidən cəhd et.";
}
