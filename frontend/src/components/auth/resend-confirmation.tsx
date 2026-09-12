"use client";

import { Loader2, MailCheck, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { toUserErrorMessage } from "@/lib/errors/user-error";
import { getAuthCallbackUrl } from "@/lib/site-url";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/// Supabase only mails a confirmation link once per sign-up. If it never
/// arrives - wrong address, spam folder, expired link, provider delay - there
/// was previously nothing the visitor could do but wait, because signing up
/// again with a known address is answered without sending anything.
///
/// Shown after a sign-up that needs confirmation, and after a sign-in that
/// fails because the address is not confirmed yet.

/// Supabase refuses a resend that arrives too soon and says how long to wait.
/// Mirroring that as a visible countdown is friendlier than letting people
/// press a button that is guaranteed to fail.
const DEFAULT_COOLDOWN_SECONDS = 60;

function cooldownFromError(message: string): number {
  // "For security purposes, you can only request this after 41 seconds."
  const match = /after (\d+) seconds?/i.exec(message);

  return match ? Number(match[1]) : DEFAULT_COOLDOWN_SECONDS;
}

export function ResendConfirmation({ email, next }: { email: string; next?: string | null }) {
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [sentOnce, setSentOnce] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  async function resend() {
    if (sending || cooldown > 0) return;

    setSending(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: getAuthCallbackUrl(next) },
      });

      if (error) throw error;

      setSentOnce(true);
      setCooldown(DEFAULT_COOLDOWN_SECONDS);
      toast.success("Təsdiq linki yenidən göndərildi", {
        description: "Gələn qutunu və spam qovluğunu yoxla.",
      });
    } catch (cause) {
      const raw = cause instanceof Error ? cause.message : String(cause);

      // A rate limit is not a failure worth alarming anybody about; it just
      // means "not yet".
      if (/rate limit|after \d+ seconds|too many/i.test(raw)) {
        const wait = cooldownFromError(raw);

        setCooldown(wait);
        toast.message(`${wait} saniyə sonra yenidən cəhd et`, {
          description: "Təhlükəsizlik üçün linklər ardıcıl göndərilmir.",
        });
      } else {
        toast.error(toUserErrorMessage(cause, "Link yenidən göndərilə bilmədi"));
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-black/20 p-3">
      <p className="flex items-start gap-2 text-xs leading-5 text-slate-400">
        <MailCheck className="mt-0.5 size-4 shrink-0 text-emerald-400" aria-hidden="true" />
        <span>
          Link <span className="font-semibold text-slate-200">{email}</span> ünvanına göndərilib.
          Gəlməyibsə spam qovluğuna bax
          {sentOnce ? " — link yenidən göndərildi." : " və ya yenidən göndər."}
        </span>
      </p>

      <button
        type="button"
        onClick={resend}
        disabled={sending || cooldown > 0}
        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/[0.1] px-3 py-2 text-[11px] font-semibold text-slate-300 transition-colors hover:border-emerald-300/30 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      >
        {sending ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <RefreshCw className="size-3.5" aria-hidden="true" />
        )}
        {cooldown > 0 ? `Yenidən göndər (${cooldown}s)` : "Təsdiq linkini yenidən göndər"}
      </button>
    </div>
  );
}
