# KiberEduAz Site Motion, About, and Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add progressive scroll motion, role-safe home/about navigation, compact breadcrumbs, and a polished public About page while simplifying the landing hero.

**Architecture:** A root-level client observer decorates server-rendered sections after hydration and CSS owns the visual transition. Pure navigation functions produce header and breadcrumb models, while the About page remains a server component composed from existing design primitives.

**Tech Stack:** Next.js 16.3 App Router, React 19, TypeScript 5, Tailwind CSS 4, IntersectionObserver, Node test runner through `tsx`.

**Spec:** `docs/superpowers/specs/2026-08-29-site-motion-about-navigation-design.md`

## Global Constraints

- Modify only `frontend/`.
- Preserve existing auth, API, role redirect, and route transition behavior.
- Do not hide server-rendered content before JavaScript runs.
- Respect `prefers-reduced-motion` and support a 320 px viewport.
- Do not commit, push, or merge unless the user explicitly requests it.

---

### Task 1: Navigation and breadcrumb models

**Files:**
- Modify: `src/lib/navigation.ts`
- Create: `src/lib/navigation/breadcrumbs.ts`
- Create: `src/components/layout/breadcrumbs.tsx`
- Modify: `src/components/layout/site-header.tsx`
- Modify: `src/components/layout/site-footer.tsx`
- Modify: `src/app/layout.tsx`
- Test: `tests/navigation.test.mjs`
- Test: `tests/breadcrumbs.test.mjs`

**Interfaces:**
- Produces: `breadcrumbsForPathname(pathname): BreadcrumbItem[]` and navigation entries for `/` and `/about` for every role.
- Consumes: `usePathname`, Next.js `Link`, existing `ChromeGate`, and current role-aware navigation functions.

- [ ] **Step 1: Write failing navigation tests.**

```js
for (const [role, pending] of [[undefined, false], ["STUDENT", false], ["TEACHER", false], ["ADMIN", false], ["TEACHER", true]]) {
  const items = navigationFor(role, pending);
  assert.ok(items.some((item) => item.href === "/"));
  assert.ok(items.some((item) => item.href === "/about"));
}
```

- [ ] **Step 2: Write failing breadcrumb tests for `/`, `/about`, `/rooms`, and `/rooms/intro-to-pentesting`.**
- [ ] **Step 3: Run both tests and confirm failures for missing signed-in home/about links and the missing breadcrumb module.**
- [ ] **Step 4: Implement breadcrumb generation, the accessible client breadcrumb bar, header icons, and footer links.**
- [ ] **Step 5: Re-run navigation and breadcrumb tests until green.**

### Task 2: Hydration-safe global section reveal

**Files:**
- Create: `src/components/effects/scroll-reveal-controller.tsx`
- Modify: `src/components/hero/cyber-hero-shell.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: a pathname-aware observer for `main section:not([data-reveal="none"])` and CSS states `.scroll-reveal` / `.is-revealed`.
- Consumes: browser IntersectionObserver, MutationObserver, `matchMedia`, and existing page-transition timing.

- [ ] **Step 1: Implement a client controller that adds reveal classes only after hydration, registers streamed sections once, and disconnects observers on route change.**
- [ ] **Step 2: Mount the controller once in the root layout and mark `CyberHeroShell` as excluded from scroll reveal.**
- [ ] **Step 3: Add staggered direct-child transitions, mobile paint-cost reductions, and immediate reduced-motion visibility.**
- [ ] **Step 4: Run `npx tsc --noEmit` and `npm run lint`; fix only task-local failures.**

### Task 3: About page and landing hero simplification

**Files:**
- Create: `src/app/about/page.tsx`
- Modify: `src/components/landing/landing-hero.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: public `/about` metadata and page content using `CyberHeroShell`, `next/image`, existing CTA classes, and automatic section reveal.
- Consumes: `/images/cyber_class_photo.jpg`, `/rooms`, `/contact`, and `/register` routes.

- [ ] **Step 1: Remove `SIGNALS`, its unused icons, and the three-card list from the landing hero without changing the right mission panel.**
- [ ] **Step 2: Build the compact About hero, mission panel, three principle cards, role-flow image section, and closing CTA.**
- [ ] **Step 3: Add only the About-specific compact hero/image CSS needed for responsive layout.**
- [ ] **Step 4: Run TypeScript and lint checks until green.**

### Task 4: Full frontend verification

**Files:**
- Verify only; add a failing regression test before any defect fix.

**Interfaces:**
- Produces: fresh evidence for behavior, compilation, public routes, and frontend-only scope.

- [ ] **Step 1: Run `npm test` and require zero failures.**
- [ ] **Step 2: Run `npm run lint` and require zero errors.**
- [ ] **Step 3: Run `npx tsc --noEmit` and require exit code 0.**
- [ ] **Step 4: Run `npm run build` and confirm `/about` is compiled with the existing routes.**
- [ ] **Step 5: Smoke-check `/` and `/about`, run `git diff --check`, and confirm every changed path is inside `frontend/`.**
