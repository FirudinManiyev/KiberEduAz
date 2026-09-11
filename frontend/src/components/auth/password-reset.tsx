"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, KeyRound, Loader2, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/logo";
import { toUserErrorMessage } from "@/lib/errors/user-error";
import { getAuthCallbackUrl } from "@/lib/site-url";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/// Where the recovery mail lands after /auth/callback has exchanged the code.
const RESET_PATH = "/reset-password";

const MIN_PASSWORD_LENGTH = 8;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-3 py-4 sm:px-5 sm:py-8">
      <div className="hero-glow absolute inset-0 -z-10" />
      <div className="cyber-grid absolute inset-0 -z-10 opacity-[0.14]" />

      <div className="relative w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#171a1c]/95 p-6 shadow-[0_35px_120px_rgba(0,0,0,.42)] backdrop-blur-xl sm:p-9">
        <div className="mb-7 flex items-center justify-between gap-4">
          <Logo />
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/15 px-3 py-2 text-[11px] font-semibold text-slate-300 transition-colors hover:border-emerald-300/25 hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <ArrowLeft
              className="size-3.5 transition-transform group-hover:-translate-x-1"
              aria-hidden="true"
            />
            Girişə qayıt
          </Link>
        </div>
        {children}
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

function ErrorNote({ message }: { message: string }) {
  return (
    <p
      className="flex items-start gap-2 rounded-xl border border-rose-300/20 bg-rose-300/[0.07] p-3 text-xs leading-5 text-rose-100"
      role="alert"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

/// Step 1: ask Supabase to mail a recovery link. The response is the same
/// whether or not the address exists, so the form cannot be used to check
/// which e-mails have an account.
export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getAuthCallbackUrl(RESET_PATH),
      });

      // Rate-limit and similar are worth surfacing; "user not found" is not,
      // and Supabase already answers 200 for it.
      if (resetError && !/not found/i.test(resetError.message)) throw resetError;

      setSent(true);
      toast.success("Link göndərildi", { description: "E-poçt qutunu yoxla." });
    } catch (cause) {
      const message = toUserErrorMessage(cause, "Link göndərilə bilmədi");
      setError(message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <Shell>
      <p className="section-kicker">Parolu bərpa et</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
        Parolunu unutmusan?
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        E-poçt ünvanını yaz; hesab varsa, yeni parol təyin etmək üçün link göndərəcəyik.
      </p>

      {sent ? (
        <p
          className="mt-7 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.07] p-4 text-sm leading-6 text-emerald-100"
          role="status"
        >
          Əgər bu ünvanla hesab varsa, bərpa linki göndərildi. Link bir dəfəlikdir və qısa
          müddət etibarlıdır. Gəlməyibsə spam qovluğuna bax.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <Field
            icon={<Mail className="size-4" aria-hidden="true" />}
            label="E-poçt"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="ad@mekteb.edu.az"
          />

          {error && <ErrorNote message={error} />}

          <button
            type="submit"
            disabled={pending}
            className="primary-action group w-full disabled:opacity-60"
          >
            <span className="relative z-10">{pending ? "Göndərilir…" : "Bərpa linki göndər"}</span>
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
      )}
    </Shell>
  );
}

/// Step 2: the visitor arrives here from /auth/callback with a recovery
/// session already in the cookie, so updateUser is all that is left.
export function ResetPasswordForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Parol ən azı ${MIN_PASSWORD_LENGTH} simvol olmalıdır.`);
      return;
    }

    if (password !== confirm) {
      setError("Parollar eyni deyil.");
      return;
    }

    setPending(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) throw updateError;

      toast.success("Parol yeniləndi", { description: "Yeni parolla daxil ola bilərsən." });
      router.replace("/dashboard");
      router.refresh();
    } catch (cause) {
      const message = toUserErrorMessage(cause, "Parol yenilənə bilmədi");
      setError(message);
      toast.error(message);
      setPending(false);
    }
  }

  return (
    <Shell>
      <p className="section-kicker">Yeni parol</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
        Yeni parol təyin et
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Ən azı {MIN_PASSWORD_LENGTH} simvol. Bu sessiya bərpa linki ilə açılıb və yalnız parol
        dəyişmək üçündür.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <Field
          icon={<KeyRound className="size-4" aria-hidden="true" />}
          label="Yeni parol"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          required
        />
        <Field
          icon={<KeyRound className="size-4" aria-hidden="true" />}
          label="Parolu təkrar yaz"
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          required
        />

        {error && <ErrorNote message={error} />}

        <button
          type="submit"
          disabled={pending}
          className="primary-action group w-full disabled:opacity-60"
        >
          <span className="relative z-10">{pending ? "Yenilənir…" : "Parolu yenilə"}</span>
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
    </Shell>
  );
}
