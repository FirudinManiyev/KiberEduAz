import type { NextConfig } from "next";

/// Static security headers. The Content-Security-Policy is deliberately NOT
/// here: it carries a per-request nonce and is set by src/proxy.ts (see
/// src/lib/security/csp.ts). Sending a second, static CSP from this file would
/// make the browser intersect the two and break the nonced scripts.
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
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
