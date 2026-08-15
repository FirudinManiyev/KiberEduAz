# KiberEduAz Content Experience Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a frontend-only seven-room MVP with Markdown-backed local lessons, responsive imagery/backgrounds, Azerbaijani FAQ, global sign-out, revised roadmap, and clear pending feedback.

**Architecture:** Keep the two existing rooms API-backed and add five local rooms through a typed catalogue plus a server-only Markdown adapter. Both sources are normalized into shared room presentation models; local completion is stored in a versioned browser record while API answer flow stays unchanged. Navigation, roadmap, imagery, loading copy, and the Acid Squares render profile consume focused shared models instead of duplicating constants.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS 4, `react-markdown`, OGL, Node test runner through `tsx`.

## Global Constraints

- Modify only `frontend/`; never edit backend source, migrations, seed data, or environment files.
- Preserve server-backed answer/progress behavior for `intro-to-pentesting` and `grc-foundations`.
- Store five local-room progress records under `kibereduaz:room-progress:v1` and label them as device-local.
- Keep supplied English GRC lesson bodies in English while Azerbaijani metadata, controls, FAQ, filters, and feedback surround them.
- Keep the dark-gray, red, and green theme; support `prefers-reduced-motion` and a 320 px viewport.

---

### Task 1: Typed local catalogue and merged room model

**Files:**
- Create: `src/lib/content/types.ts`
- Create: `src/lib/content/catalog.ts`
- Create: `src/lib/content/rooms.ts`
- Test: `tests/content-catalog.test.mjs`

**Interfaces:**
- Produces: `LOCAL_ROOM_CATALOG`, `LocalRoomDefinition`, `LearningRoomSummary`, `mergeRoomSummaries(apiRooms)` and `getLocalRoomDefinition(slug)`.
- Consumes: existing `RoomSummary`, exact image paths under `/images`, and the five new Markdown filenames.

- [ ] **Step 1: Write the failing catalogue test**

```js
test("five local rooms merge into seven unique discoverable rooms", () => {
  const merged = mergeRoomSummaries([apiPentest, apiGrc]);
  assert.equal(LOCAL_ROOM_CATALOG.length, 5);
  assert.equal(merged.length, 7);
  assert.equal(new Set(merged.map((room) => room.slug)).size, 7);
  assert.ok(merged.every((room) => room.image.startsWith("/images/")));
});
```

- [ ] **Step 2: Run `npm test -- tests/content-catalog.test.mjs` and confirm failure because the content modules do not exist.**
- [ ] **Step 3: Add exact metadata for `grc-roles-three-lines`, `grc-frameworks-landscape`, `risk-identification`, `introduction-to-blue-team`, and `soc-windows-event-logs-sysmon`; decorate API rooms without overwriting their progress.**
- [ ] **Step 4: Re-run the catalogue test and confirm it passes.**

### Task 2: Markdown-to-task adapter

**Files:**
- Create: `src/lib/content/markdown.ts`
- Test: `tests/markdown-content.test.mjs`

**Interfaces:**
- Consumes: `LocalRoomDefinition.sourceFile`, `taskHeadings`, and UTF-8 files in `src/data/`.
- Produces: `loadLocalRoom(slug): Promise<LearningRoomDetail | null>` and `parseLocalMarkdown(definition, source)` for deterministic tests.

- [ ] **Step 1: Write failing tests asserting Blue Team yields five `## Task` sections and GRC heading groups yield five non-empty tasks, with tables/code preserved inside Markdown strings and parsed question prompts attached to their task.**
- [ ] **Step 2: Run `npm test -- tests/markdown-content.test.mjs` and confirm the missing parser failure.**
- [ ] **Step 3: Implement heading-range extraction, intro attachment, question extraction for `**Sual N.N**`, and curated GRC group boundaries; reject empty task sets.**
- [ ] **Step 4: Run the Markdown test and the full catalogue test until both pass.**

### Task 3: Device-local progress reducer

**Files:**
- Create: `src/lib/content/local-progress.ts`
- Test: `tests/local-progress.test.mjs`

**Interfaces:**
- Produces: `LOCAL_PROGRESS_KEY`, `emptyLocalProgress()`, `parseLocalProgress(raw)`, `completeLocalTask(state, roomSlug, taskId, points)`, and `solveLocalQuestion(state, roomSlug, taskId, questionId, points)`.
- Consumes: serializable version-1 progress records only; corrupt or mismatched input returns empty state.

- [ ] **Step 1: Write failing literal-expectation tests for completion, duplicate-completion idempotence, serialized reload, corrupt JSON, and version mismatch.**
- [ ] **Step 2: Run `npm test -- tests/local-progress.test.mjs` and confirm the module-not-found failure.**
- [ ] **Step 3: Implement pure reducer functions with unique IDs and earned XP totals.**
- [ ] **Step 4: Re-run the progress tests and confirm all cases pass.**

### Task 4: Hybrid rooms catalogue and local lesson player

**Files:**
- Modify: `src/app/rooms/page.tsx`
- Modify: `src/app/rooms/[slug]/page.tsx`
- Modify: `src/components/room/room-browser.tsx`
- Modify: `src/components/room/room-card.tsx`
- Modify: `src/components/room/lesson-player.tsx`
- Create: `src/components/room/lesson-markdown.tsx`
- Create: `src/components/room/local-lesson-player.tsx`

**Interfaces:**
- Consumes: `mergeRoomSummaries`, `loadLocalRoom`, `LearningRoomSummary`, `LearningRoomDetail`, and local-progress pure functions.
- Produces: API failure-tolerant `/rooms`, image-backed cards, local/API badges, image-backed room heroes, and local completion/check interactions without API calls.

- [ ] **Step 1: Extend the catalogue test with an API failure fallback assertion returning five local summaries; run it red.**
- [ ] **Step 2: Merge `apiFetchOrNull('/rooms') ?? []` with local summaries and render the compact synchronization notice when the API list is unavailable.**
- [ ] **Step 3: Route local slugs through `loadLocalRoom` before API fetch, add `next/image` art, and preserve API 404 handling.**
- [ ] **Step 4: Render Markdown with responsive table/pre wrappers and implement local answer/completion state backed by `localStorage`; keep the existing API `LessonPlayer` request path intact.**
- [ ] **Step 5: Run all content/progress tests and `npx tsc --noEmit`; resolve only failures caused by this task.**

### Task 5: Catalogue-driven three-track roadmap

**Files:**
- Create: `src/lib/content/roadmap.ts`
- Modify: `src/app/roadmap/page.tsx`
- Test: `tests/roadmap.test.mjs`

**Interfaces:**
- Produces: `ROADMAP_TRACKS` containing Red Team, Blue Team, and GRC with every available room exactly once plus explicit locked stages.
- Consumes: `LOCAL_ROOM_CATALOG` and metadata decorators for the two API room slugs.

- [ ] **Step 1: Write a failing test asserting three tracks, seven unique available links, and no missing catalogue slug.**
- [ ] **Step 2: Run the roadmap test and confirm failure because the model is missing.**
- [ ] **Step 3: Implement the shared roadmap model and refactor the page to render three responsive track cards and seven-room summary copy.**
- [ ] **Step 4: Re-run roadmap and content tests.**

### Task 6: Azerbaijani FAQ and global navigation/sign-out

**Files:**
- Create: `src/lib/navigation.ts`
- Create: `src/components/faq/faq-browser.tsx`
- Create: `src/app/faq/page.tsx`
- Create: `src/components/auth/sign-out-button.tsx`
- Modify: `src/components/layout/site-header.tsx`
- Modify: `src/components/layout/site-footer.tsx`
- Modify: `src/app/profile/page.tsx`
- Modify: `src/app/pending/page.tsx`
- Test: `tests/navigation.test.mjs`

**Interfaces:**
- Produces: `navigationFor(role, pending)`, searchable/filterable FAQ disclosures, and a form-status-aware sign-out control posting to `/auth/signout`.
- Consumes: existing `SiteHeaderUser`, existing sign-out route, and `LinkLoadingIndicator`.

- [ ] **Step 1: Write failing navigation tests for FAQ visibility in guest/student/teacher/admin menus and sign-out visibility rules.**
- [ ] **Step 2: Run the navigation test and confirm the missing shared model failure.**
- [ ] **Step 3: Implement shared navigation, add accessible FAQ search/category/disclosures, and link FAQ from header/mobile/footer.**
- [ ] **Step 4: Add one reusable `SignOutButton` with `useFormStatus`, pending label `Hesabdan çıxılır…`, and duplicate-submit prevention; use it in desktop, mobile, profile, and pending views.**
- [ ] **Step 5: Re-run navigation tests and TypeScript.**

### Task 7: Responsive Acid Squares render profile and overflow fix

**Files:**
- Create: `src/lib/effects/acid-render-profile.ts`
- Modify: `src/components/effects/acid-squares.tsx`
- Modify: `src/components/effects/global-acid-background.tsx`
- Modify: `src/app/globals.css`
- Test: `tests/acid-render-profile.test.mjs`

**Interfaces:**
- Produces: `getAcidRenderProfile({ width, coarsePointer, reducedMotion, devicePixelRatio })` with exact desktop/mobile/reduced-motion settings.
- Consumes: Acid Squares props and runtime media-query/device metrics.

- [ ] **Step 1: Write failing tests asserting mobile uses 20 steps, DPR 1, blur 0, and no pointer; reduced motion also stops continuous animation; desktop retains 32 steps and capped DPR.**
- [ ] **Step 2: Run the render-profile test and confirm it fails because the helper is absent.**
- [ ] **Step 3: Implement the profile and apply it inside Acid Squares before renderer/targets/listeners are created.**
- [ ] **Step 4: Replace the `inset:-4%/108%` global layer with `inset:0`, `100%`, `100svh`, containment, clipping, and a CSS WebGL fallback; make lesson tables/code independently scrollable.**
- [ ] **Step 5: Re-run profile tests and TypeScript.**

### Task 8: Image-rich landing/profile presentation and loading copy

**Files:**
- Modify: `src/app/page.tsx`
- Modify: relevant files under `src/components/landing/`
- Modify: `src/components/profile/profile-editor.tsx`
- Modify: `src/components/feedback/site-loader.tsx`
- Modify: `src/app/loading.tsx`
- Modify: `src/components/auth/auth-form.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: the eight supplied images through `next/image` with stable aspect ratios and `sizes`.
- Produces: image-backed hero/classroom sections, profile avatars, Azerbaijani route/initial/auth pending messages, and layouts with no document-level horizontal overflow.

- [ ] **Step 1: Replace static auth submit text while pending with mode-specific Azerbaijani copy and preserve `aria-live` status semantics.**
- [ ] **Step 2: Add the cybersecurity and classroom imagery to the landing composition and use teacher/student profile assets in profile presentation.**
- [ ] **Step 3: Add concise Azerbaijani text to global route skeleton and initial loader; audit `min-width`, absolute ornaments, image `sizes`, and mobile grids at 320/390 px.**
- [ ] **Step 4: Run `npm test`, `npm run lint`, and `npx tsc --noEmit`; fix task-local issues.**

### Task 9: Full verification

**Files:**
- Verify only; modify the smallest frontend file only if verification exposes a reproducible defect and first add a failing regression test.

**Interfaces:**
- Produces: fresh evidence for tests, lint, typecheck, production build, route generation, and frontend-only diff scope.

- [ ] **Step 1: Run `npm test` and require zero failures.**
- [ ] **Step 2: Run `npm run lint` and require zero errors.**
- [ ] **Step 3: Run `npx tsc --noEmit` and require exit code 0.**
- [ ] **Step 4: Run `npm run build` and require exit code 0 with `/faq`, `/rooms`, local room routes, and `/roadmap` compiled.**
- [ ] **Step 5: Run `git diff --name-only HEAD~1..HEAD` plus `git status --short` and confirm every implementation path is inside `frontend/`.**

