# Security remediation — September 2026

Work against four audit reports. Every finding was re-verified against the code
before anything was changed; the reports contradicted each other in several
places and some of them were wrong.

Ten commits, `24a34ca..b5ac271`. Backend and frontend both build, lint and test
clean at every commit.

---

## 1. Findings

### Confirmed and fixed

| ID | Finding | What was done | Files | Commit |
|---|---|---|---|---|
| **F-01** / auth-report 1–2 / pentest #3 | BOLA on rooms: any approved teacher could read answer keys and rewrite any room | `assertCanManageRoom` on `findByIdForAuthor`, `update`, `upsertTask`, `removeTask`; nested `taskId` validated against its parent `roomId`; delete scoped to the room | `catalog/rooms.{controller,service}.ts` | `24a34ca` |
| **F-14** | Teachers saw every draft in the system | Listings scoped to own drafts + all published; visibility `AND`-composed so the search `OR` can't shadow it | `catalog/rooms.service.ts` | `24a34ca` |
| **F-02** / pentest #1–2 | BOLA on paths and modules — controllers didn't even receive the caller | `assertCanManagePath` / `assertCanManageModule`; `createModule` requires ownership of the destination path; re-parenting checks the destination too | `catalog/paths.{controller,service}.ts` | `88a157b` |
| **Publish bypass** (live PoC, 10 Sep) | `PATCH /modules/:id` with `"status":"PUBLISHED"` wrote status unfiltered | `withSafeStatus` strips `status` for non-admins on create **and** update | `catalog/paths.service.ts` | `88a157b` |
| **F-04** | TOCTOU double points payout | Two partial unique indexes; payout derived from `createMany({ skipDuplicates })` inside the transaction, so the loser pays nothing and still gets a normal response | `progress/progress.service.ts` + migration | `2d7d0f5` |
| **F-03** | Critical `next` advisory | `next` 16.3.0 → **16.3.4**, `eslint-config-next` pinned to match, `npm audit fix`. Frontend now **0 advisories** | `frontend/package.json` | `1285723` |
| **F-10 / H-001** (partial — see below) | Legacy tables outside the RLS loop | RLS + revoke on the 7 tourism tables and `_prisma_migrations`, then a sweep over any remaining public table with RLS off | migration `…_rls_legacy_tables` | `624e923` |
| **Email → localhost** (main functional bug) | `signUp` built `emailRedirectTo` from `window.location.origin` | `lib/site-url.ts`; `getSiteUrl()` throws in production if unset, falls back only in dev | `lib/site-url.ts`, `auth-form.tsx` | `4c99d61` |
| **F-06** | Open redirect: `safePath` rejected `//` but not `/\evil.com` | `safeRelativePath` resolves against the site origin and compares origins; rejects `\`, `%5C`, `%2F%2F`, absolute URLs, control chars | `lib/site-url.ts` | `4c99d61` |
| **F-07** | Redirect origin trusted `x-forwarded-host` | Pinned to `getSiteUrl()` | `auth/callback/route.ts` | `4c99d61` |
| **Long-lived code-verifier** (cookie report 2.4) | PKCE verifier carried a ~1 year `Expires` | Explicitly cleared after the exchange | `auth/callback/route.ts` | `4c99d61` |
| **F-08** | `next.config.ts` was empty — zero security headers | HSTS, nosniff, `X-Frame-Options: DENY`, Referrer-Policy, Permissions-Policy, and CSP as **Report-Only** | `next.config.ts` | `549101a` |
| **Secure=false** (cookie report 2.2) | Session cookies had no `Secure` flag | `secure: true` in production on all three `@supabase/ssr` clients | `lib/supabase/cookie-options.ts` | `549101a` |
| **F-11 / M-002** | `callback(new Error())` aborted at the network layer; `*` was a real wildcard | `callback(null, false)` + server-side warn; a bare `*` no longer matches anything | `common/cors.ts`, `main.ts` | `5306be8` |
| **F-12 / M-004** | P2002 echoed constraint/column names; raw Prisma messages could reach the caller | Generic conflict message, generic 500; detail to the log only | `common/prisma-exception.filter.ts` | `5306be8` |
| **M-003** | Bare `helmet()` left CSP off | Explicit API config: `default-src 'none'`, `frame-ancestors 'none'`, `no-referrer` | `main.ts` | `5306be8` |
| **F-13 / M-001** | One global 120/min for everything | `@Throttle`: 30/min answers, 30/min leaderboard, 20/min profile updates | 3 controllers | `5306be8` |
| **F-05** | Teacher self-request had no specific limit | 5/day on `POST /profiles/me/request-teacher` | `profiles.controller.ts` | `5306be8` |
| **F-15** | Leaderboard fell back to the email local-part | Deterministic pseudonym from the profile id (`Tələbə #A3F9`) | `leaderboard.service.ts` | `5306be8` |
| **F-09** | No account deletion path at all | `DELETE /profiles/me` soft-delete + admin purge/restore; see `docs/account-deletion.md` | `profiles/account-deletion.service.ts` + migration | `b5ac271` |

### Second pass — gaps found while re-reading the code (12 Sep)

Not from any report. Found by tracing what the first pass touched.

| Finding | What was done | Files | Commit |
|---|---|---|---|
| **Throttler saw one IP for everyone.** Express was never told to trust Render's proxy, so `req.ip` was the proxy for every request: 120 legitimate requests/min from *anyone* locked *everyone* out, and every per-route limit was per-deployment, not per-client | `app.set('trust proxy', 1)` on a typed `NestExpressApplication` | `main.ts` | `2f6d129` |
| F-14 only covered listings. `GET /rooms/:slug` and `GET /paths` still showed a teacher every other teacher's draft; a teacher could attach a room to somebody else's unreviewed draft module | Same published-or-own rule on `findBySlug`, on `tree` at every level, and on module attachment (create + re-parent) | `rooms.service.ts`, `paths.service.ts` | `65624d1` |
| `avatarKey` accepted arbitrary text up to 40 chars | `@Matches(/^[a-z][a-z0-9-]{0,39}$/)` | `update-profile.dto.ts` | `4e59c19` |
| **F-06 guard had a hole**: `/%5Cevil.com` passed — the raw checks never saw the backslash and URL resolution keeps the escape. Found by writing the tests | Same checks repeated on the decoded form; malformed escapes rejected. 17 payloads tested | `site-url.ts`, `tests/site-url.test.mjs` | `9fee509` |
| CSP `script-src 'unsafe-inline'` neutered the one directive that matters against XSS | Per-request nonce minted in the proxy, handed to Next.js via `x-nonce`/CSP request headers; `'strict-dynamic'`; static CSP removed from `next.config.ts` (two policies intersect). Still Report-Only | `proxy.ts`, `lib/security/csp.ts`, `next.config.ts` | `be2ce74` |
| `DELETE /profiles/me` had no UI | Danger-zone section with typed confirmation; signs out and lands on `/login` | `delete-account.tsx`, `profile/page.tsx` | `4641e99` |
| **No password reset existed at all** | `/forgot-password` → `resetPasswordForEmail` with `redirectTo` pinned to the site URL → `/auth/callback?next=/reset-password` → `updateUser({ password })`. Same response whether or not the address exists | `password-reset.tsx`, two pages, login link | `2074195` |
| Purge had no scheduler | `@nestjs/schedule`, nightly 03:00, in-process, idempotent, never throws out of the tick | `account-deletion.service.ts` | `4fed9d6` |
| No audit trail (P3) | `audit_log` table + `AuditService`; actor threaded through every admin endpoint; `GET /admin/audit` | `src/audit/`, migration `…000400` | `28f002c` |

### False positives — verified, not "fixed"

| ID | Claim | Why it's wrong |
|---|---|---|
| **H-002** | IDOR at `profiles.service.ts:105-127` and `classes.service.ts:153-164` | `105-127` is `changeRole`, reachable only through `@Roles(UserRole.ADMIN)` on the controller. `153-164` is `removeStudent`, which already calls `assertCanManage` — the very pattern the other reports hold up as correct. Neither takes an attacker-controlled `profileId` without a check. |
| **F-10, in part** | "No RLS policies exist anywhere in the repository" | The init migration (`20260811000000_init`, lines ~349-369) already enables RLS **and** revokes `anon, authenticated` on all 16 application tables. Absence of *policies* is deliberate default-deny, not absence of RLS. Only the legacy tables were genuinely uncovered — that part was real and is fixed. |
| **C-001 / C-002** | "Critical: Supabase credentials in git history / config files" | Only the **publishable (anon)** key and the project ref, both public by design and already documented as such in `.env.example`. A full `git log --all` scan found **no** `service_role` key, no `sb_secret_`, no populated `SUPABASE_SECRET_KEY`, and no database password. No history rewrite, no key rotation. Left the real values in `.env.example`: the accompanying comments already say they are safe to expose, and replacing them with placeholders would make that comment read as a lie. |
| **Pentest report: CSRF "Vulnerable"** | "No CSRF tokens" | The API authenticates with a `Bearer` header, not an ambient cookie, so a cross-site request cannot carry credentials. No tokens added, per instruction. |
| **Pentest report: "Next.js 15"** | — | Lockfile says 16. The consolidated audit was right. |
| **Pentest report: race conditions "Clean"** | — | F-04 was real. The consolidated audit was right. |
| **Pentest report: H-001 "RLS-enabled tables for all application data"** vs its own "legacy tables without RLS" | — | Both half-true; see F-10 above. |
| **Cookie report: `SameSite=Strict`** | Recommended Strict | **Not applied, deliberately.** Clicking a confirmation link in a mail client is a cross-site navigation; under Strict the PKCE `code-verifier` would not be sent to `/auth/callback` and signup would break. Kept `Lax`. |
| **Cookie report: `HttpOnly=true`** | Recommended HttpOnly | **Not applied** — see §4. |

### Already correct (no change needed)

Rooms already stripped `status` for non-admins and already restricted
`/rooms/:id/publish`, `/unpublish` and `DELETE /rooms/:id` to `@Roles(ADMIN)`.
The "Appendix A ready-made files" the pentest report mentioned were **not**
present in the tree — nothing had been pre-applied.

---

## 2. Migrations, in order

Apply with `npx prisma migrate deploy`. They are ordered by timestamp and that
order matters.

1. **Pre-flight, read-only — run this by hand first:**
   `backend/prisma/manual/find_duplicate_correct_attempts.sql`
   Reports duplicate correct attempts and duplicate room bonuses. **If query 2
   returns anything other than `0`, stop** — migration 3 below will fail and
   roll back. Nothing is deleted automatically, on purpose; query 3 marks which
   row to keep (the earliest) and query 4 sizes the over-payment, so tell me the
   numbers and I'll write the correction.
2. `20260911000000_module_ownership` — adds `learning_modules.created_by_id`
   (nullable + FK + index). Safe on a live table.
3. `20260911000100_answer_attempt_idempotency` — the two partial unique
   indexes. **This is the one that can fail**, and only because of step 1.
4. `20260911000200_rls_legacy_tables` — RLS + revoke on legacy tables. Safe and
   replayable; guarded with `to_regclass` so it still works after the legacy
   tables are dropped.
5. `20260911000300_account_deletion` — adds `profiles.deleted_at` + partial
   index. Safe.
6. `20260911000400_audit_log` — new `audit_log` table, RLS on. Safe.

⚠️ **Prisma cannot see partial indexes.** A future `prisma migrate dev` will
offer to drop the three from steps 3 and 5. Don't let it. Both models carry a
`///` comment saying so.

---

## 3. Manual steps for you

**Before deploying**

1. **Vercel → Environment Variables: set `NEXT_PUBLIC_SITE_URL`** to the real
   production origin (e.g. `https://kiber-edu-az-one.vercel.app`, no trailing
   slash). **The production build now throws without it** — that is the point,
   but it means a deploy fails fast if you skip this.
2. **Supabase → Authentication → URL Configuration**: add
   `<site-url>/auth/callback` to the Redirect Allow List, and set Site URL to
   the same origin. The code now sends an explicit `emailRedirectTo`; Supabase
   still has to allow it.
3. **Render → `CORS_ORIGINS`** (it is `sync: false`, so I can't see it):
   confirm it is **not** `*`. A bare `*` now matches nothing, so if production
   relies on it, cross-origin calls will start failing. Set it to the explicit
   production origin(s).
4. Run the pre-flight SQL from §2 step 1.

**After deploying**

5. Re-run the PoC: `TEACHER_TOKEN=… API_URL=… OTHER_ROOM_ID=… DRAFT_MODULE_ID=… ./scripts/security-smoke.sh`
   — expects 403 on all of them. Read-only by design: the writes target rooms the
   token doesn't own, and the publish attempt sets `DRAFT`, which the target
   already is, so nothing breaks even if a check unexpectedly passes.
6. Optionally `./scripts/reproduce-points-race.sh` with a **throwaway learner**
   account (it does write).
7. **Supabase → Auth → Rate Limits.** Login and registration go straight from
   the browser to Supabase Auth and never touch the NestJS API, so no backend
   `@Throttle` can protect them. The brute-force limits the reports asked for
   have to be set in the dashboard. This is the one M-001 item I could not fix
   in code.
8. Rotate the password of the teacher account used in the 10 Sep live PoC and
   revoke its sessions (the pentest report's own recommendation).
9. **Verify the Data API**, the thing F-10 could not prove from source:
   ```
   curl 'https://<ref>.supabase.co/rest/v1/User?select=*' -H 'apikey: <publishable_key>'
   ```
   Data returned means it was exposed; after migration 4 it should not be.
   Disabling the Data API entirely is cleaner still — nothing uses it.
10. Schedule the deletion purge. Three options in `docs/account-deletion.md`;
    I'd take `@nestjs/schedule`, which needs no long-lived admin token.

---

## 4. Not done — needs your decision

**HttpOnly auth cookies.** Not applied, and this one is not a flag.
`frontend/src/lib/api/client.ts` calls `supabase.auth.getSession()` **in the
browser** to build the `Authorization: Bearer` header for every client-side API
call. Making the cookies `httpOnly` would break all of them. The options:

- **A — leave as is.** The real defence is the absence of XSS (no
  `dangerouslySetInnerHTML` anywhere, `react-markdown` doesn't render raw HTML)
  plus the new CSP. Zero effort, and the risk is precisely "if an XSS ever
  lands, sessions are stealable".
- **B — route API calls through Next.js route handlers.** Browser calls
  same-origin `/api/*`, the handler attaches the token server-side from the
  httpOnly cookie. Cookies become httpOnly for real. Roughly 1–2 days: every
  `apiRequest` call site plus a proxy layer, and you take a latency hop.
- **C — split tokens.** Refresh token httpOnly, short-lived access token in
  memory only. Best security, most work (~3–4 days), and it fights
  `@supabase/ssr`'s defaults.

My recommendation: **A now, B when the content-editing surfaces grow**, since
that is where an XSS would most plausibly appear.

**Backend dependencies — 6 high advisories left** (from 10). Every remaining one
has only a semver-**major downgrade** as npm's "fix": `@nestjs/core` 11 → 7.5.5,
`prisma` 6.16 → 6.12. I did not do those, per your instruction and because they
would be worse than the advisories. Detail: `multer` arrives through
`@nestjs/platform-express` and the app has **no upload surface**, so it is not
reachable; `deepmerge-ts` sits inside `@prisma/config`, a CLI/build dependency,
not the runtime. Both need upstream releases. I did remove `@nestjs/swagger`,
which nothing in `src` imported — if you were saving it for planned API docs,
revert that one line.

**Legacy tables not dropped**, as instructed — `drop_legacy_tables.sql` is
untouched and waiting for your backup. RLS now covers them, so they are no
longer exposed in the meantime.

**Content of deleted teachers.** Purge cascades everything keyed to the profile
but leaves authored `Path`/`Module`/`Room` rows with `created_by_id = null`, so
a deletion cannot take a published curriculum down. If your retention policy
says otherwise, that's a product decision with a different implementation.

**CSP is Report-Only.** It will not block anything yet. Review the violation
reports, then flip the header name to `Content-Security-Policy`. Next.js inlines
its bootstrap without a nonce, so `'unsafe-inline'` in `script-src` is what makes
it survivable today; a nonce via middleware would be the stricter follow-up.

**`.env.example` values left real** — see the C-001/C-002 row above.
