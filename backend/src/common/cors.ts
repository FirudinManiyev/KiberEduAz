/// Matches a request origin against the CORS_ORIGINS allow list.
///
/// Entries are exact origins (`https://kiberedu.vercel.app`) unless they start
/// with `*`, in which case the rest is treated as a hostname suffix. Vercel
/// preview domains look like `<project>-<hash>-<team>.vercel.app`, so
/// `*-<team>.vercel.app` keeps previews working without allowing every project
/// hosted on vercel.app.
export function isAllowedOrigin(origin: string, allowList: string[]): boolean {
  return allowList.some((entry) => {
    if (entry === '*') {
      return true;
    }

    if (entry.startsWith('*')) {
      return hostnameOf(origin)?.endsWith(entry.slice(1)) ?? false;
    }

    return entry === origin;
  });
}

function hostnameOf(origin: string): string | null {
  try {
    return new URL(origin).hostname;
  } catch {
    return null;
  }
}
