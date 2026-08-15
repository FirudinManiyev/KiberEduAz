# KiberEduAz responsive navigation and toast refresh

## Scope

This frontend-only change removes the FAQ search, resets scroll position after route changes, replaces scattered progress messages with a shared toast experience, simplifies the landing hero media, and reduces mobile rendering cost. Backend code and API contracts are outside the scope.

## User experience

### FAQ

- Remove the text search field and its query state.
- Keep the category filters so the page remains easy to browse.
- Update the result summary and empty-state copy so they refer only to categories.

### Navigation and scroll

- Every pathname change resets the document to the top immediately.
- Internal navigation shows a compact loading toast while the destination is pending.
- The toast is dismissed when navigation completes or the initiating link is unmounted.
- Existing inline link dots may remain as a small local affordance, but the toast is the primary loading message.

### Async feedback

- Add one globally mounted Sonner toaster with KiberEduAz dark/red/green styling.
- Login, registration, logout, profile saving, task-answer checking, and lesson-progress saving use loading, success, and error toasts.
- Buttons stay disabled and retain concise pending labels where needed for accessibility and duplicate-submit prevention.
- Existing API behavior, validation, and navigation destinations remain unchanged.

### Landing hero

- Remove the interactive mini task console from the right column.
- Remove badges and content overlays so that area contains only the responsive cybersecurity image.
- Preserve a subtle border, crop, and hover treatment without introducing extra client-side JavaScript.

## Responsive and performance design

- On narrow or coarse-pointer devices, render the global WebGL background as a static frame rather than a continuous animation.
- Replace expensive mobile route effects based on blur and clip-path with opacity and a small translation.
- Suppress perspective card transforms and continuous hover scan animations on devices without hover capability.
- Ensure page wrappers, hero media, grids, and long content use `min-width: 0` and viewport-safe maximum widths.
- Keep intentionally scrollable code blocks, tables, tabs, and compact category rows locally contained.
- Preserve the richer desktop visual treatment when the device can render and interact with it comfortably.

## Architecture

- Root layout owns the single toast viewport.
- The route template owns pathname-based scroll restoration.
- The existing link loading indicator bridges Next.js link pending state to the route toast.
- Feature components emit their own action-specific toasts without introducing a second notification system.
- The current AcidSquares render-profile helper remains the single place for choosing mobile versus desktop render cost.

## Verification

- Unit tests cover FAQ filtering changes and the low-cost AcidSquares profile.
- Lint, TypeScript checks, the full test suite, and a production build must pass.
- Browser checks cover desktop and mobile widths, FAQ categories, route scroll restoration, hero layout, navigation toast, authentication feedback, and local lesson progress feedback.
- Confirm the final diff contains no backend changes.
