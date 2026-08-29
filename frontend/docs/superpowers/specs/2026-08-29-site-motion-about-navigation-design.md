# KiberEduAz Site Motion, About, and Navigation Design

## Goal

Add consistent scroll-triggered motion across the frontend, introduce compact breadcrumbs where they improve orientation, create a polished public About page, expose the public landing page to signed-in users from the header, and simplify the landing hero by removing its three lower-left signal cards.

## Constraints

- All changes stay inside `frontend/`; backend APIs and data remain untouched.
- Existing route transition animations, authentication behavior, role redirects, and navigation loading indicators remain intact.
- Scroll motion must not hide content when JavaScript is unavailable and must respect `prefers-reduced-motion`.
- Breadcrumbs stay compact and do not appear on `/`, `/login`, `/register`, or `/register/teacher`.
- The About page is public, responsive down to 320 px, and intentionally compact.

## Scroll Motion

A single client controller lives in the root layout and watches the current pathname. It discovers `main section` elements, except sections marked `data-reveal="none"`, and progressively registers sections added during streamed or client-side navigation.

The controller adds a setup class only after hydration, so server-rendered content stays visible without JavaScript. IntersectionObserver reveals each section once as it enters the viewport, using a 1% threshold so very tall lesson sections cannot remain hidden, plus a small lower root margin. CSS animates the section's direct children with a short stagger: opacity, vertical movement, blur, and slight scale settle into place using the existing page motion curve. Heroes use the existing page-enter animation and opt out of scroll reveal.

Reduced-motion visitors receive the final visible state immediately. Touch and narrow layouts use shorter travel and no blur to reduce paint cost.

## Breadcrumbs and Navigation

`breadcrumbsForPathname(pathname)` is a pure navigation model that returns Azerbaijani breadcrumb items. The client breadcrumb bar reads `usePathname`, renders nothing for landing/auth routes, and provides `aria-label="Səhifə yolu"`. Intermediate items are links; the final item uses `aria-current="page"`.

Every desktop and mobile navigation model includes an explicit `Ana səhifə` link for guests, students, teachers, admins, and pending teachers. `Haqqımızda` is also available to every role and in both footer variants. The logo continues linking to `/`.

## About Page

`/about` uses the existing cyber visual language without becoming a long marketing page:

- Compact cyber-background hero with purpose copy and links to rooms/contact.
- A glass mission panel describing safe, scenario-based learning.
- Three principle cards: practical learning, classroom visibility, and safe simulation.
- One image-supported section showing how school, teacher, and student roles connect.
- A compact closing CTA.

The supplied `cyber_class_photo.jpg` is rendered with `next/image`, a stable aspect ratio, responsive sizes, and a dark gradient overlay.

## Landing Hero Simplification

The three lower-left signal cards and their constants/icons are removed from `LandingHero`. The headline, description, CTAs, background, and right-side mission panel stay unchanged. The resulting negative space keeps the hero focused and avoids duplicating information already explained below the fold.

## Testing and Verification

- Navigation tests assert every role has `/` and `/about` links.
- Breadcrumb tests assert hidden routes, regular pages, and room-detail hierarchy.
- Existing component tests remain green.
- Final checks run `npm test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`.
- Route smoke checks verify `/` and `/about` return HTTP 200 and include expected public content.
