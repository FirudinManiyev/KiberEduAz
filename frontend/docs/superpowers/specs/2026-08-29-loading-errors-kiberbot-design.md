# Loading, User-safe Errors and KiberBot Design

## Goal

Improve frontend feedback without changing backend behavior: show meaningful loading states, prevent developer-facing error details from reaching users, and add a polished UI-only KiberBot chat widget.

## Scope

- Frontend files under `frontend/` only.
- No API, database, authentication, or backend contract changes.
- KiberBot is local UI state only and performs no network request.
- Existing visual language, responsive behavior, motion preferences, and Azerbaijani copy are preserved.

## Architecture

### User-safe error layer

`src/lib/errors/user-error.ts` will be the single translation boundary for errors displayed by interactive components. It classifies `ApiError.status`, ordinary error text, and browser connectivity state, but returns only fixed Azerbaijani messages. Arbitrary `Error.message`, stack traces, service names, database terms, URLs, tokens, or backend payloads are never returned directly.

Known categories are: offline/network, expired session, forbidden, not found, validation, conflict, rate limit, and service unavailable. Call sites may provide an operation-specific safe fallback such as “Profil saxlanıla bilmədi.”

### Route feedback

A reusable `RouteLoading` component provides an accessible skeleton and status label. The root `loading.tsx` uses this component, so every streamed route receives consistent feedback.

`app/error.tsx` handles route rendering failures with a user-safe Azerbaijani message, a retry action, and a link to the home page. `app/global-error.tsx` handles root-layout failures and renders its own document and styles as required by Next.js 16.3. Neither boundary renders the supplied error message or digest.

The existing not-found page remains the user-facing 404 boundary, with its developer-style `ERROR_404` label replaced by plain user copy.

### KiberBot

`KiberBot` is mounted inside `ChromeGate`, which keeps the auth screens focused while making the widget available on all normal site pages. A fixed launcher sits in the lower-right corner and opens a responsive chat panel above it.

The panel contains an initial explanation, a scrollable message history, a text field, and a send action. Valid submitted text is added as a user message. A short local typing state follows, then KiberBot appends the fixed response: the service is currently inactive and will be available later. Empty messages are ignored. No message is sent or persisted outside the browser component state.

The panel supports Escape to close, focus transfer to the input, accessible labels, live status announcements, reduced-motion behavior, and timer cleanup. Toasts move to the upper-right to avoid overlapping the required lower-right widget.

## Error copy policy

- Authentication errors use actionable wording such as incorrect credentials or expired session.
- Permissions, validation, missing data, conflicts, throttling, connectivity, and unavailable service each receive a distinct safe message.
- Unknown failures receive an operation-specific fallback or a neutral retry-later message.
- Raw backend strings and callback query error descriptions are classified but never echoed.

## Loading policy

- Route navigation uses lightweight skeletons instead of blank content.
- Existing form buttons keep their inline spinners and disabled states.
- KiberBot uses animated dots only during its local simulated response.
- All loading feedback includes `role="status"` or `aria-live` text and respects reduced motion.

## Testing

- Unit tests verify error category mapping and confirm that technical strings never appear in returned messages.
- Unit tests verify KiberBot trims valid input, rejects empty input, and returns the inactive-service response.
- Existing tests guard navigation, room presentation, auth copy, and motion behavior.
- Final verification runs tests, ESLint, TypeScript, a production Next.js build, scope checks, and whitespace checks.

## Acceptance criteria

1. Users see useful loading feedback during route transitions and pending actions.
2. User-visible error surfaces do not expose arbitrary developer/backend error text.
3. Route and global rendering failures have recoverable Azerbaijani fallback pages.
4. KiberBot is fixed at the lower-right on normal pages, opens and closes accessibly, accepts text, and replies that the service is inactive.
5. KiberBot performs no backend request and does not appear on login/register screens.
6. Frontend tests, lint, type-check, and production build pass.
