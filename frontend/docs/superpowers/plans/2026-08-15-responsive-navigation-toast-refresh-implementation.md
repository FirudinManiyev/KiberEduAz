# Responsive Navigation and Toast Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a smooth responsive frontend with category-only FAQ browsing, automatic route scroll restoration, unified toast feedback, a simpler image-only landing hero, and cheaper mobile effects.

**Architecture:** Mount one Sonner viewport in the root layout, bridge Next link pending state to it, and let feature components publish action-specific toast states. Keep route scroll restoration in the App Router template and keep device-cost decisions centralized in the existing AcidSquares render-profile helper.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Sonner 2, Node test runner via `tsx`.

## Global Constraints

- Modify only `frontend`; do not change backend files or API contracts.
- Keep the existing dark gray, red, and green visual language.
- Preserve desktop effects while eliminating mobile overflow and expensive continuous rendering.
- Use Azerbaijani user-facing copy.
- Preserve button pending states for accessibility even when a toast is shown.

---

### Task 1: Category-only FAQ browser

**Files:**
- Modify: `frontend/tests/faq.test.mjs`
- Modify: `frontend/src/lib/faq.ts`
- Modify: `frontend/src/components/faq/faq-browser.tsx`

**Interfaces:**
- Consumes: `FAQ_ITEMS`, `FAQ_CATEGORIES`, `FaqFilter`.
- Produces: `filterFaqItems(items: readonly FaqItem[], category: FaqFilter): FaqItem[]`.

- [ ] **Step 1: Write the failing category-only test**

```js
test("FAQ filtering uses only the selected category", () => {
  const all = filterFaqItems(FAQ_ITEMS, "Hamısı");
  const security = filterFaqItems(FAQ_ITEMS, "Müəllim və təhlükəsizlik");

  assert.equal(all.length, FAQ_ITEMS.length);
  assert.ok(security.length >= 3);
  assert.ok(security.every((item) => item.category === "Müəllim və təhlükəsizlik"));
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `npm test -- --test-name-pattern="FAQ filtering uses only"`

Expected: FAIL because `filterFaqItems` still expects a query and a third category argument.

- [ ] **Step 3: Remove search behavior and simplify the filter**

```ts
export function filterFaqItems(
  items: readonly FaqItem[],
  category: FaqFilter,
): FaqItem[] {
  return category === "Hamısı"
    ? [...items]
    : items.filter((item) => item.category === category);
}
```

Update `FaqBrowser` to remove `Search`, `query`, the search input, query-aware reset behavior, and search-specific empty-state copy. Compute `visibleItems` from category only and retain the horizontal category row.

- [ ] **Step 4: Run FAQ tests and confirm GREEN**

Run: `npm test -- --test-name-pattern="FAQ"`

Expected: all FAQ tests pass and no test refers to text search.

- [ ] **Step 5: Commit the isolated FAQ change**

```bash
git add frontend/tests/faq.test.mjs frontend/src/lib/faq.ts frontend/src/components/faq/faq-browser.tsx
git commit -m "refactor: simplify FAQ category browsing"
```

### Task 2: Low-cost mobile background profile

**Files:**
- Modify: `frontend/tests/acid-render-profile.test.mjs`
- Modify: `frontend/src/lib/effects/acid-render-profile.ts`
- Modify: `frontend/src/app/globals.css`

**Interfaces:**
- Consumes: `AcidRenderProfileInput` from the existing WebGL component.
- Produces: `getAcidRenderProfile(input): AcidRenderProfile` where every low-cost profile has `animate: false`.

- [ ] **Step 1: Change the mobile expectation to a static frame**

```js
test("narrow coarse-pointer screens render one low-cost Acid Squares frame", () => {
  const profile = getAcidRenderProfile({
    width: 390,
    coarsePointer: true,
    reducedMotion: false,
    devicePixelRatio: 3,
  });

  assert.equal(profile.detail, "low");
  assert.equal(profile.dpr, 1);
  assert.equal(profile.mouseInteraction, false);
  assert.equal(profile.animate, false);
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `npm test -- --test-name-pattern="narrow coarse-pointer"`

Expected: FAIL because the current mobile profile returns `animate: true`.

- [ ] **Step 3: Make all low-cost profiles deterministic**

```ts
if (lowCost) {
  return {
    detail: "low",
    steps: 20,
    dpr: 1,
    blur: 0,
    mouseInteraction: false,
    animate: false,
  };
}
```

In the mobile and no-hover media rules, replace page-entry blur/clip effects with opacity and a small translate, remove perspective hover transforms, stop scan animations, reduce large blur glows, and keep horizontal scrolling limited to explicit local containers.

- [ ] **Step 4: Run render-profile tests and confirm GREEN**

Run: `npm test -- --test-name-pattern="Acid Squares|reduced motion|desktop visual"`

Expected: all render-profile tests pass.

- [ ] **Step 5: Commit the mobile performance change**

```bash
git add frontend/tests/acid-render-profile.test.mjs frontend/src/lib/effects/acid-render-profile.ts frontend/src/app/globals.css
git commit -m "perf: reduce mobile visual rendering cost"
```

### Task 3: Shared navigation toast and scroll restoration

**Files:**
- Create: `frontend/src/lib/navigation/scroll.ts`
- Create: `frontend/tests/scroll.test.mjs`
- Create: `frontend/src/components/feedback/app-toaster.tsx`
- Modify: `frontend/src/components/feedback/link-loading-indicator.tsx`
- Modify: `frontend/src/app/layout.tsx`
- Modify: `frontend/src/app/template.tsx`

**Interfaces:**
- Produces: `scrollToPageTop(scroll: (options: ScrollToOptions) => void): void`.
- Produces: a single Sonner toast id, `route-loading`, shared by all pending links.
- Consumes: Next.js `usePathname()` and `useLinkStatus()`.

- [ ] **Step 1: Write the failing scroll-helper test**

```js
test("route changes request an immediate scroll to page top", () => {
  let received;
  scrollToPageTop((options) => {
    received = options;
  });

  assert.deepEqual(received, { top: 0, left: 0, behavior: "instant" });
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `npm test -- --test-name-pattern="route changes request"`

Expected: FAIL because `src/lib/navigation/scroll.ts` does not exist.

- [ ] **Step 3: Add the helper, toast viewport, and route integrations**

```ts
export function scrollToPageTop(
  scroll: (options: ScrollToOptions) => void,
): void {
  scroll({ top: 0, left: 0, behavior: "instant" });
}
```

`template.tsx` becomes a client component, watches `pathname`, calls `scrollToPageTop(window.scrollTo.bind(window))`, and retains `.page-transition`. `AppToaster` renders one bottom-right Sonner viewport with close buttons and dark styling. `LinkLoadingIndicator` calls `toast.loading("Səhifə hazırlanır…", { id: "route-loading" })` while pending and dismisses that id when pending ends or the link unmounts.

- [ ] **Step 4: Run the focused test and static checks**

Run: `npm test -- --test-name-pattern="route changes request"`

Run: `npx tsc --noEmit`

Expected: the test and TypeScript check pass.

- [ ] **Step 5: Commit the shared navigation experience**

```bash
git add frontend/tests/scroll.test.mjs frontend/src/lib/navigation/scroll.ts frontend/src/components/feedback/app-toaster.tsx frontend/src/components/feedback/link-loading-indicator.tsx frontend/src/app/layout.tsx frontend/src/app/template.tsx
git commit -m "feat: add route toasts and scroll restoration"
```

### Task 4: Image-only responsive landing hero

**Files:**
- Modify: `frontend/src/components/landing/landing-hero.tsx`
- Modify: `frontend/src/app/globals.css`

**Interfaces:**
- Consumes: Next Image asset `/images/cybersecurity_photo.jpg`.
- Produces: a server-rendered right hero column with no `CommandConsole`, chips, or content overlay.

- [ ] **Step 1: Record the current bundle-bearing import**

Run: `rg -n "CommandConsole|Red Team|Blue Team|GRC" src/components/landing/landing-hero.tsx`

Expected: matches show the interactive console and three image badges.

- [ ] **Step 2: Remove interactive hero content**

Delete the `CommandConsole` import and component, the negative overlap wrapper, the three image badges, and the content gradient. Keep a viewport-safe `aspect-[16/10]` image shell with `min-w-0`, `max-w-full`, responsive `sizes`, a subtle border, and a scale-only hover effect guarded by hover capability.

- [ ] **Step 3: Verify the hero contains only the image**

Run: `rg -n "CommandConsole|Red Team|Blue Team|GRC" src/components/landing/landing-hero.tsx`

Expected: no matches.

Run: `npx tsc --noEmit`

Expected: TypeScript passes and the removed import leaves no unused symbols.

- [ ] **Step 4: Commit the hero simplification**

```bash
git add frontend/src/components/landing/landing-hero.tsx frontend/src/app/globals.css
git commit -m "refactor: simplify landing hero media"
```

### Task 5: Toast feedback for every asynchronous user action

**Files:**
- Modify: `frontend/src/components/auth/auth-form.tsx`
- Modify: `frontend/src/components/auth/sign-out-button.tsx`
- Modify: `frontend/src/components/profile/profile-editor.tsx`
- Modify: `frontend/src/components/room/local-lesson-player.tsx`

**Interfaces:**
- Consumes: the root Sonner viewport from Task 3.
- Produces: unique toast ids for `auth-submit`, `sign-out`, `profile-save`, `lesson-save`, and `answer-check` operations.

- [ ] **Step 1: Add action-specific toast lifecycles**

For each submit/check function, create a stable loading toast before awaiting, replace it with a success toast on success, and replace it with an error toast using the same translated error shown inline. Use these Azerbaijani loading messages:

```ts
toast.loading(mode === "login" ? "Hesaba daxil olunur…" : "Hesab yaradılır…", {
  id: "auth-submit",
});
toast.loading("Hesabdan çıxılır…", { id: "sign-out" });
toast.loading("Profil saxlanılır…", { id: "profile-save" });
toast.loading("Progress saxlanılır…", { id: "lesson-save" });
toast.loading("Cavab yoxlanılır…", { id: "answer-check" });
```

Keep existing inline validation errors and disabled button labels because they provide form-local context and accessible state.

- [ ] **Step 2: Verify all requested operations publish a toast**

Run: `rg -n "auth-submit|sign-out|profile-save|lesson-save|answer-check" src/components`

Expected: each id appears in its owning feature component.

- [ ] **Step 3: Run full static and unit verification**

Run: `npm test`

Run: `npm run lint`

Run: `npx tsc --noEmit`

Run: `npm run build`

Expected: all tests, lint, TypeScript, and production build pass.

- [ ] **Step 4: Perform browser verification**

At 390x844 and 1440x900, verify `/`, `/faq`, `/rooms`, `/profile`, and one local room. Confirm no horizontal page overflow; the mobile background is static; FAQ search is absent; the hero right column contains only the image; changing routes resets scroll to zero; route and action toasts appear without blocking controls.

- [ ] **Step 5: Verify frontend-only scope and commit**

Run: `git diff --name-only HEAD -- . ":(exclude)frontend/**"`

Expected: no backend or out-of-scope file is listed for this implementation.

```bash
git add frontend/src/components/auth/auth-form.tsx frontend/src/components/auth/sign-out-button.tsx frontend/src/components/profile/profile-editor.tsx frontend/src/components/room/local-lesson-player.tsx
git commit -m "feat: unify async action feedback"
```
