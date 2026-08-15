"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      closeButton
      position="bottom-right"
      theme="dark"
      visibleToasts={4}
      toastOptions={{
        duration: 3200,
        style: {
          background: "rgba(23, 25, 27, 0.97)",
          border: "1px solid rgba(248, 113, 113, 0.2)",
          color: "#f1f5f9",
          boxShadow: "0 22px 70px rgba(0, 0, 0, 0.45)",
        },
      }}
    />
  );
}
