import type { NextConfig } from "next";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/// Origin of a full URL, so a configured API path such as
/// https://host/api/v1 contributes `https://host` to connect-src.
function originOf(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

const connectSrc = [
  "'self'",
  ...new Set([originOf(SUPABASE_URL), originOf(API_URL)].filter(Boolean) as string[]),
  // Supabase Realtime / auth refresh use the same host over wss.
  ...new Set(
    [originOf(SUPABASE_URL)]
      .filter(Boolean)
      .map((origin) => (origin as string).replace(/^https:/, "wss:")),
  ),
];

/// Report-Only to start with. Next.js inlines its bootstrap and the flight
/// payload as <script> tags without a nonce unless middleware generates one,
/// so 'unsafe-inline' is what makes an enforced policy realistic today;
/// shipping this as a report first means the violation log decides, rather
/// than a guess that takes the site down. Promote to Content-Security-Policy
/// once the reports are clean.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src ${connectSrc.join(" ")}`,
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  // Vercel serves HTTPS only; this stops a downgrade before it happens and
  // is the header half of the cookie Secure flag set in the Supabase clients.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "Content-Security-Policy-Report-Only", value: csp },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
