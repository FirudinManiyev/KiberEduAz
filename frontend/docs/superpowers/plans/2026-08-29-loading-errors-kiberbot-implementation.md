# Loading, User-safe Errors and KiberBot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add consistent loading feedback, safe Azerbaijani error handling, and a frontend-only KiberBot chat widget.

**Architecture:** A pure error translator and pure KiberBot exchange helper define testable behavior. Reusable feedback components consume them, while Next.js route conventions provide loading and error boundaries. The bot stays local to the client and is mounted through the existing chrome gate.

**Tech Stack:** Next.js 16.3 App Router, React 19, TypeScript, Tailwind CSS 4, Lucide React, Sonner, Node test runner via `tsx`.

**Spec:** `docs/superpowers/specs/2026-08-29-loading-errors-kiberbot-design.md`

## Global Constraints

- Modify frontend files under `frontend/` only.
- Do not add backend calls, persistence, or new dependencies.
- Never render arbitrary error messages, stack traces, digests, URLs, tokens, database terms, or service internals to users.
- User-facing copy is concise Azerbaijani.
- Interactive and animated UI remains keyboard accessible and respects reduced motion.

---

### Task 1: Pure user-safe error translation

**Files:**
- Create: `tests/user-error.test.mjs`
- Create: `src/lib/errors/user-error.ts`

**Interfaces:**
- Produces: `toUserErrorMessage(cause: unknown, fallback?: string): string`

- [ ] **Step 1: Write failing table-driven tests** for HTTP statuses, offline/network errors, authentication phrases, unknown technical errors, and a safe operation fallback. Assert literal Azerbaijani outputs and assert that sensitive input fragments are absent.
- [ ] **Step 2: Run `npm test -- tests/user-error.test.mjs`** and confirm failure because the module does not exist.
- [ ] **Step 3: Implement the minimal classifier** using status and case-insensitive pattern checks while returning fixed copy only.
- [ ] **Step 4: Run `npm test -- tests/user-error.test.mjs`** and confirm all cases pass.

### Task 2: Pure KiberBot exchange behavior

**Files:**
- Create: `tests/kiberbot.test.mjs`
- Create: `src/lib/kiberbot/exchange.ts`

**Interfaces:**
- Produces: `createKiberBotExchange(input: string): { userText: string; reply: string } | null`

- [ ] **Step 1: Write failing tests** proving whitespace-only text is rejected, valid text is trimmed, and the fixed reply clearly says the service is inactive.
- [ ] **Step 2: Run `npm test -- tests/kiberbot.test.mjs`** and confirm failure because the module does not exist.
- [ ] **Step 3: Implement the pure exchange helper** without IDs, timers, storage, or network calls.
- [ ] **Step 4: Run `npm test -- tests/kiberbot.test.mjs`** and confirm all cases pass.

### Task 3: Apply safe errors to user-visible operations

**Files:**
- Modify: `src/components/admin/admin-console.tsx`
- Modify: `src/components/teacher/teacher-console.tsx`
- Modify: `src/components/profile/profile-editor.tsx`
- Modify: `src/components/room/lesson-player.tsx`
- Modify: `src/components/auth/auth-form.tsx`
- Modify: `src/app/auth/callback/route.ts`

**Interfaces:**
- Consumes: `toUserErrorMessage(cause, fallback)` from Task 1.

- [ ] **Step 1: Replace raw `cause.message` display paths** with operation-specific calls to the translator.
- [ ] **Step 2: Keep existing pending states and success messages** while ensuring auth callback reasons use stable safe codes instead of raw provider descriptions.
- [ ] **Step 3: Run the focused and full test suites** and confirm existing behavior remains green.

### Task 4: Loading and rendering error boundaries

**Files:**
- Create: `src/components/feedback/route-loading.tsx`
- Modify: `src/app/loading.tsx`
- Create: `src/app/error.tsx`
- Create: `src/app/global-error.tsx`
- Modify: `src/app/not-found.tsx`

**Interfaces:**
- Produces: `RouteLoading({ label?, compact? })` for route fallback UI.

- [ ] **Step 1: Extract the existing skeleton into `RouteLoading`** with `role="status"`, screen-reader text, and reusable compact layout support.
- [ ] **Step 2: Make root `loading.tsx` render the shared component.**
- [ ] **Step 3: Add route and global error boundaries** with retry and home actions, never rendering the error prop.
- [ ] **Step 4: Replace developer-style not-found copy** with plain, actionable wording.

### Task 5: KiberBot widget

**Files:**
- Create: `src/components/kiberbot/kiberbot.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/feedback/app-toaster.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `createKiberBotExchange(input)` from Task 2.

- [ ] **Step 1: Build the fixed launcher and responsive panel** with initial assistant message, input, send button, close action, and message history.
- [ ] **Step 2: Add local delayed reply behavior** with typing state, timer cleanup, focus management, Escape close, and empty-input prevention.
- [ ] **Step 3: Mount the widget inside `ChromeGate`** and move Sonner to the upper-right to prevent overlap.
- [ ] **Step 4: Add opening, message, typing-dot, and launcher animations** plus reduced-motion overrides.

### Task 6: Verification

**Files:**
- Verify all files changed by Tasks 1–5.

- [ ] **Step 1: Run `npm test`** and confirm every test passes.
- [ ] **Step 2: Run `npm run lint`** and resolve every error.
- [ ] **Step 3: Run `npx tsc --noEmit`** and resolve every type error.
- [ ] **Step 4: Run `npm run build`** and confirm all routes compile.
- [ ] **Step 5: Start the production server and smoke-test `/`, `/about`, `/login`, and an unknown route** for successful HTML responses and expected safe copy.
- [ ] **Step 6: Run `git diff --check` and inspect `git status --short`** to confirm no backend files changed and no whitespace errors were introduced.
