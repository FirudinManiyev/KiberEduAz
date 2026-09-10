import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("next/navigation", {
  namedExports: {
    usePathname() {
      return "/";
    },
  },
});

const { default: ContactPage } = await import("../src/app/contact/page.tsx");
const { LandingCta } = await import("../src/components/landing/landing-cta.tsx");
const { LandingHero } = await import("../src/components/landing/landing-hero.tsx");
const { SiteHeader } = await import("../src/components/layout/site-header.tsx");
const { RoomBrowser } = await import("../src/components/room/room-browser.tsx");
const { mergeRoomSummaries } = await import("../src/lib/content/rooms.ts");

test("the Room catalogue exposes a compact three-column card layout", () => {
  const rooms = mergeRoomSummaries([]);
  const html = renderToStaticMarkup(createElement(RoomBrowser, { rooms }));

  assert.match(html, /data-room-grid="three-column"/);
  assert.equal((html.match(/data-room-density="compact"/g) ?? []).length, rooms.length);
});

test("the contact FAQ panel links to the full FAQ instead of duplicating questions", () => {
  const html = renderToStaticMarkup(createElement(ContactPage));

  assert.match(html, /<a(?=[^>]*href="\/faq")[^>]*>/);
  assert.doesNotMatch(html, /<details/);
});

test("public navigation and landing surfaces omit decorative live-system labels", () => {
  const html = [
    renderToStaticMarkup(createElement(SiteHeader, { user: null, unreadCount: 0 })),
    renderToStaticMarkup(createElement(LandingHero)),
    renderToStaticMarkup(createElement(LandingCta)),
    renderToStaticMarkup(createElement(ContactPage)),
  ].join(" ");

  assert.doesNotMatch(
    html,
    /Sistem aktivdir|Platforma aktivdir|Əlaqə kanalı aktivdir|Komanda kanalı açıqdır|Canlı tədris axını|Sistem hazırdır/,
  );
});
