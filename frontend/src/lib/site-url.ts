/// The public origin of this deployment.
///
/// Every Supabase auth mail (confirmation, password reset, magic link, email
/// change) carries a redirect built from this. It must never be derived from
/// `window.location.origin` or from forwarded request headers: the first sends
/// a link to whatever host the visitor happened to sign up from - `localhost`
/// during development, which is what made confirmation mails from production
/// bounce to a dead address - and the second is attacker-controlled behind any
/// proxy that forwards client headers unfiltered.
///
/// In production the variable is required and its absence throws, rather than
/// silently falling back to localhost. Locally it defaults to the dev server.
const DEV_FALLBACK = "http://localhost:3000";

function normalize(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;

  if (configured && configured.trim()) {
    const url = normalize(configured);

    // A bare host in the env var would produce a relative redirect.
    if (!/^https?:\/\//.test(url)) {
      throw new Error(
        `NEXT_PUBLIC_SITE_URL must include the scheme, e.g. https://example.com (got "${configured}")`,
      );
    }

    return url;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL is required in production: auth mails would otherwise link to the wrong origin.",
    );
  }

  return DEV_FALLBACK;
}

/// Landing URL for auth mails, optionally preserving where the visitor was
/// headed before they were asked to sign in.
export function getAuthCallbackUrl(next?: string | null): string {
  const base = `${getSiteUrl()}/auth/callback`;

  return next ? `${base}?next=${encodeURIComponent(next)}` : base;
}

/// True when `next` is a path on this site and nothing else.
///
/// Rejects protocol-relative (`//evil.com`), backslash (`/\evil.com`, which
/// browsers normalise to `//`), absolute, and percent-encoded variants of the
/// same, by resolving the candidate and comparing origins rather than by
/// blacklisting prefixes.
export function safeRelativePath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/")) return null;

  // Control characters and backslashes never belong in a path we generated.
  // Browsers normalise a backslash to a slash, so /\evil.com is protocol-relative.
  if (value.includes("\\")) return null;

  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);

    if (code < 0x20 || code === 0x7f) return null;
  }

  // The same checks again on the decoded form, so %5C and %2F%2F cannot
  // smuggle in what the raw checks just refused. Malformed escapes are not a
  // path we generated either.
  let decoded: string;

  try {
    decoded = decodeURIComponent(value);
  } catch {
    return null;
  }

  if (decoded.startsWith("//") || decoded.includes("\\")) return null;

  for (let i = 0; i < decoded.length; i += 1) {
    const code = decoded.charCodeAt(i);

    if (code < 0x20 || code === 0x7f) return null;
  }

  let site: URL;

  try {
    site = new URL(getSiteUrl());
  } catch {
    return null;
  }

  try {
    const resolved = new URL(value, site);

    if (resolved.origin !== site.origin) return null;

    // Re-encoded forms such as %5C or %2F%2F only reveal themselves after
    // parsing, so re-check the decoded pathname.
    if (resolved.pathname.startsWith("//") || resolved.pathname.includes("\\")) {
      return null;
    }

    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return null;
  }
}
