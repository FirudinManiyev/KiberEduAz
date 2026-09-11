"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api/client";
import { toUserErrorMessage } from "@/lib/errors/user-error";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/// The word the learner has to type before the button does anything. Not a
/// security control - a guard against a slip of the hand on an action that
/// signs them out on the spot.
const CONFIRM_WORD = "SİL";

type DeletionReceipt = {
  deletedAt: string;
  purgeAfter: string;
  restoreWindowDays: number;
};

export function DeleteAccount() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const armed = typed.trim().toLocaleUpperCase("az") === CONFIRM_WORD;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!armed || pending) return;

    setPending(true);
    setError(null);
    toast.loading("Hesab silinir…", { id: "delete-account" });

    try {
      const receipt = await apiRequest<DeletionReceipt>("/profiles/me", { method: "DELETE" });

      // The API refuses this account from the next request on; drop the
      // local session too so the browser does not keep a dead token around.
      await createSupabaseBrowserClient().auth.signOut();

      toast.success("Hesab silindi", {
        id: "delete-account",
        description: `${receipt.restoreWindowDays} gün ərzində bərpa üçün dəstəyə yazmaq olar.`,
      });
      router.replace("/login");
      router.refresh();
    } catch (cause) {
      const message = toUserErrorMessage(cause, "Hesab silinə bilmədi");
      setError(message);
      toast.error(message, { id: "delete-account" });
      setPending(false);
    }
  }

  return (
    <section className="rounded-2xl border border-rose-300/15 bg-[#1a1d1f] p-5 sm:p-7">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-rose-300/20 bg-rose-300/[0.06] text-rose-300">
          <Trash2 className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-white">Hesabı sil</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Profilin, irəliləyişin, xalların və sinif üzvlüklərin silinəcək. Hesab dərhal
            bağlanır; 30 gün ərzində dəstəyə yazaraq bərpa etmək olar, sonra məlumatlar
            tamamilə təmizlənir.
          </p>
        </div>
      </div>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-rose-300/25 bg-rose-300/[0.07] px-4 py-2.5 text-xs font-semibold text-rose-200 transition-colors hover:border-rose-300/45 hover:bg-rose-300/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/40"
        >
          Hesabı silmək istəyirəm
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-slate-400">
              Təsdiq üçün <span className="font-mono text-rose-200">{CONFIRM_WORD}</span> yaz
            </span>
            <input
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 font-mono text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-rose-300/40 focus:ring-2 focus:ring-rose-300/10"
              placeholder={CONFIRM_WORD}
              aria-describedby="delete-account-help"
            />
            <span id="delete-account-help" className="mt-2 block text-[11px] text-slate-600">
              Bu addımdan sonra dərhal çıxış ediləcək.
            </span>
          </label>

          {error && (
            <p
              className="flex items-start gap-2 rounded-xl border border-rose-300/20 bg-rose-300/[0.07] p-3 text-xs leading-5 text-rose-100"
              role="alert"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={!armed || pending}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 className="size-4" aria-hidden="true" />
              )}
              Hesabı həmişəlik sil
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setTyped("");
                setError(null);
              }}
              disabled={pending}
              className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:border-white/[0.16] disabled:opacity-40"
            >
              İmtina
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
