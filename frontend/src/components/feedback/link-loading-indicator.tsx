"use client";

import { useLinkStatus } from "next/link";

export function LinkLoadingIndicator() {
  const { pending } = useLinkStatus();

  return (
    <span className="inline-flex items-center" role={pending ? "status" : undefined}>
      <span
        className={`link-pending-indicator ${pending ? "link-pending-indicator--active" : ""}`}
        aria-hidden="true"
      />
      {pending && <span className="sr-only">Səhifə hazırlanır…</span>}
    </span>
  );
}
