"use client";

import { useLinkStatus } from "next/link";
import { useEffect } from "react";
import { toast } from "sonner";

const ROUTE_TOAST_ID = "route-loading";

export function LinkLoadingIndicator() {
  const { pending } = useLinkStatus();

  useEffect(() => {
    if (pending) {
      toast.loading("Səhifə hazırlanır…", { id: ROUTE_TOAST_ID });
      return () => {
        toast.dismiss(ROUTE_TOAST_ID);
      };
    }

    toast.dismiss(ROUTE_TOAST_ID);
  }, [pending]);

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
