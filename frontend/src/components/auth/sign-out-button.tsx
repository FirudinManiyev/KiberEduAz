"use client";

import { Loader2, LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

type SignOutButtonProps = {
  variant?: "header" | "mobile" | "panel";
  onAction?: () => void;
};

export function SignOutButton({ variant = "panel", onAction }: SignOutButtonProps) {
  function handleSubmit() {
    toast.loading("Hesabdan çıxılır…", { id: "sign-out" });
    onAction?.();
  }

  return (
    <form action="/auth/signout" method="post" onSubmit={handleSubmit} className={variant === "mobile" ? "w-full" : undefined}>
      <SubmitButton variant={variant} />
    </form>
  );
}

function SubmitButton({ variant }: { variant: NonNullable<SignOutButtonProps["variant"]> }) {
  const { pending } = useFormStatus();
  const shared = "inline-flex items-center justify-center gap-2 rounded-xl border text-xs font-semibold transition-all disabled:cursor-wait disabled:opacity-60";
  const variantClass =
    variant === "header"
      ? "min-h-10 border-red-300/15 bg-red-300/[0.055] px-3 text-red-200 hover:-translate-y-0.5 hover:border-red-300/30 hover:bg-red-300/[0.1]"
      : variant === "mobile"
        ? "min-h-11 w-full border-red-300/12 bg-red-300/[0.045] px-3 text-red-200 hover:border-red-300/25 hover:bg-red-300/[0.08]"
        : "min-h-10 border-white/[0.08] px-3.5 text-slate-400 hover:border-rose-300/25 hover:bg-rose-300/[0.06] hover:text-rose-200";

  return (
    <button type="submit" disabled={pending} className={`${shared} ${variantClass}`} aria-live="polite">
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <LogOut className="size-4" aria-hidden="true" />}
      <span>{pending ? "Hesabdan çıxılır…" : variant === "header" ? "Çıxış" : "Hesabdan çıx"}</span>
    </button>
  );
}
