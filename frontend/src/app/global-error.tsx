"use client";

export function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="az">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          boxSizing: "border-box",
          background: "#121416",
          color: "#f8fafc",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <title>KiberEduAz · Sistem xətası</title>
        <main style={{ width: "100%", maxWidth: 560, textAlign: "center" }}>
          <div
            aria-hidden="true"
            style={{
              width: 64,
              height: 64,
              display: "grid",
              placeItems: "center",
              margin: "0 auto",
              border: "1px solid rgba(248,113,113,.25)",
              borderRadius: 18,
              background: "rgba(248,113,113,.07)",
              color: "#fca5a5",
              fontSize: 28,
            }}
          >
            !
          </div>
          <h1 style={{ margin: "24px 0 0", fontSize: 32 }}>Sistem müvəqqəti əlçatan deyil</h1>
          <p style={{ margin: "12px auto 0", maxWidth: 460, color: "#94a3b8", lineHeight: 1.7 }}>
            Səhifəni hazırlayarkən problem yarandı. Məlumatların təhlükəsizdir; bir az sonra yenidən cəhd et.
          </p>
          <button
            type="button"
            onClick={retry}
            style={{
              minHeight: 48,
              marginTop: 28,
              border: 0,
              borderRadius: 12,
              padding: "0 22px",
              background: "#ef4444",
              color: "white",
              fontSize: 14,
              fontWeight: 750,
              cursor: "pointer",
            }}
          >
            Yenidən cəhd et
          </button>
        </main>
      </body>
    </html>
  );
}

export default GlobalError;
