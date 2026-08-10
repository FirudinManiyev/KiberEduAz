"use client";

import { useLinkStatus } from "next/link";

export function LinkLoadingIndicator() {
  const { pending } = useLinkStatus();

  return (
    <span
      className={`link-pending-indicator ${pending ? "link-pending-indicator--active" : ""}`}
      aria-hidden="true"
    />
  );
}
