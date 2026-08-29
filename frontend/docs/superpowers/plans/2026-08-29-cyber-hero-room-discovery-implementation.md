# KiberEduAz Cyber Hero and Room Discovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship three layered cyber-background heroes, semantic room artwork, and accessible eight-item progressive disclosure across room-heavy frontend views.

**Architecture:** A server-compatible `CyberHeroShell` centralizes the shared image and decorative layers while each page supplies its own content. A pure room-artwork resolver decorates API and local presentation models, and a small client hook owns progressive list state without moving server data fetching into the browser.

**Tech Stack:** Next.js 16.3 App Router, React 19, TypeScript 5, Tailwind CSS 4, Node test runner through `tsx`.

**Spec:** `docs/superpowers/specs/2026-08-29-cyber-hero-room-discovery-design.md`

## Global Constraints

- Modify only `frontend/`; do not edit backend source, data, migrations, or environment files.
- Use `/images/cyber_background.jpg` for landing, student, and teacher heroes.
- Default progressive list size is exactly eight.
- Preserve API mutation, role redirect, room progress, and task sequence behavior.
- Do not create commits unless the user explicitly requests them.

---

### Task 1: Semantic room artwork resolver

**Files:**
- Create: `src/lib/content/room-artwork.ts`
- Modify: `src/lib/content/catalog.ts`
- Modify: `src/lib/content/rooms.ts`
- Modify: `src/components/room/room-card.tsx`
- Test: `tests/room-artwork.test.mjs`
- Test: `tests/content-catalog.test.mjs`

**Interfaces:**
- Consumes: `{ slug: string; title: string; category: string }` and optional existing presentation metadata.
- Produces: `resolveRoomArtwork(room): { image: string; imageAlt: string; track: LearningTrack }`.

- [ ] **Step 1: Write the failing topic and fallback tests.**

```js
assert.equal(resolveRoomArtwork({ slug: "sql-injection", title: "SQL Injection", category: "Red Team" }).image, "/images/sql_photo.jpg");
assert.equal(resolveRoomArtwork({ slug: "new-soc-room", title: "Log analizi", category: "Blue Team" }).image, "/images/soc_photo.jpg");
assert.equal(resolveRoomArtwork({ slug: "new-risk-room", title: "Risk", category: "GRC" }).image, "/images/grc_photo.jpg");
```

- [ ] **Step 2: Run `npm test -- tests/room-artwork.test.mjs` and confirm failure because the resolver is missing.**
- [ ] **Step 3: Implement exact topic rules, category fallbacks, Azerbaijani alt text, and track normalization.**
- [ ] **Step 4: Apply the resolver to API summaries/details and raw room cards; update local catalogue art to the supplied Blue Team, SOC, and GRC images.**
- [ ] **Step 5: Run room-artwork and content-catalog tests until green.**

### Task 2: Reusable eight-item progressive disclosure

**Files:**
- Create: `src/lib/ui/progressive-list.ts`
- Create: `src/components/home/progressive-room-roadmap.tsx`
- Modify: `src/components/room/room-browser.tsx`
- Modify: `src/components/teacher/teacher-console.tsx`
- Modify: `src/app/dashboard/page.tsx`
- Test: `tests/progressive-list.test.mjs`

**Interfaces:**
- Produces: `INITIAL_VISIBLE_ITEMS = 8`, `getVisibleItems(items, expanded, limit)`, and `useProgressiveItems(items, resetKey?)`.
- Consumes: filtered room arrays, dashboard rooms, teacher rooms/classes/students.

- [ ] **Step 1: Write failing literal tests for 12 items collapsed to IDs 1–8, expansion to all 12, and a five-item list with no hidden remainder.**
- [ ] **Step 2: Run `npm test -- tests/progressive-list.test.mjs` and confirm the missing module failure.**
- [ ] **Step 3: Implement the pure slice helper and client hook with reset-key collapse behavior.**
- [ ] **Step 4: Add accessible expand/collapse buttons to the room browser and the three teacher lists.**
- [ ] **Step 5: Extract the student roadmap list into a focused client component and keep its numbering/order stable while expanding.**
- [ ] **Step 6: Run progressive-list tests and `npx tsc --noEmit` until green.**

### Task 3: Shared layered hero and three page variants

**Files:**
- Create: `src/components/hero/cyber-hero-shell.tsx`
- Modify: `src/components/landing/landing-hero.tsx`
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/components/teacher/teacher-console.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: `CyberHeroShell({ children, className?, priority? })` with one background image, contrast layers, grid, scan, and decorative accents.
- Consumes: existing landing CTA, student `CommandConsole`, teacher profile and aggregate counts.

- [ ] **Step 1: Build the shell with `next/image`, responsive `sizes`, priority loading where above the fold, and pointer-inert decorative layers.**
- [ ] **Step 2: Replace the landing hero image card with a glass mission-status panel and retain existing CTA/navigation semantics.**
- [ ] **Step 3: Move the student hero into the shared shell while keeping the live summary and command console.**
- [ ] **Step 4: Convert the teacher header and separate stats row into a single responsive hero while leaving forms and API actions below it.**
- [ ] **Step 5: Add responsive/reduced-motion CSS for hero layers and confirm 320 px layouts do not overflow.**

### Task 4: Full frontend verification

**Files:**
- Verify only; if a reproducible defect appears, add a failing regression test before the smallest frontend fix.

**Interfaces:**
- Produces: fresh evidence for tests, lint, typecheck, production build, route compilation, and frontend-only scope.

- [ ] **Step 1: Run `npm test` and require zero failures.**
- [ ] **Step 2: Run `npm run lint` and require zero errors.**
- [ ] **Step 3: Run `npx tsc --noEmit` and require exit code 0.**
- [ ] **Step 4: Run `npm run build` and require `/`, `/dashboard`, `/teacher`, and `/rooms` to compile.**
- [ ] **Step 5: Inspect `git status --short` and confirm every task change is under `frontend/`.**
