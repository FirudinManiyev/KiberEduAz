/// Content Security Policy for the Next.js app, built per request so every
/// inline <script> Next emits can carry a one-time nonce instead of the site
/// needing 'unsafe-inline'. Shared by the proxy middleware (which generates
/// the nonce and sets the header) and by nothing else on purpose: the static
/// headers in next.config.ts must not also send a CSP, or the two would be
/// intersected by the browser.
///
/// Still shipped as Report-Only. Flip `CSP_HEADER` to the enforcing name once
/// the violation reports have been reviewed.

export const CSP_HEADER = "Content-Security-Policy-Report-Only";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const IS_DEV = process.env.NODE_ENV !== "production";

function originOf(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function unique(values: (string | null)[]): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

const supabaseOrigin = originOf(SUPABASE_URL);

const connectSrc = unique([
  "'self'",
  supabaseOrigin,
  originOf(API_URL),
  // Supabase Realtime and token refresh use the same host over wss.
  supabaseOrigin?.replace(/^https:/, "wss:") ?? null,
  // Next.js dev server HMR.
  IS_DEV ? "ws:" : null,
]);

/// Random, unguessable, unique per response. base64 so it survives the
/// header and the attribute unescaped.
export function createNonce(): string {
  const bytes = new Uint8Array(16);

  crypto.getRandomValues(bytes);

  return btoa(String.fromCharCode(...bytes));
}

export function buildCsp(nonce: string): string {
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    // Lets a nonced script load its own chunks without listing each one.
    "'strict-dynamic'",
    // React Refresh evaluates modules in development only.
    IS_DEV ? "'unsafe-eval'" : null,
  ].filter(Boolean);

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    `script-src ${scriptSrc.join(" ")}`,
    // Tailwind and framer-motion set style attributes; nonces do not cover
    // those, so styles stay on 'unsafe-inline'. That is a much smaller
    // surface than inline scripts.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(" ")}`,
    "worker-src 'self' blob:",
    "upgrade-insecure-requests",
  ].join("; ");
}
