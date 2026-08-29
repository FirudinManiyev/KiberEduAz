import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ErrorPage } from "../src/app/error.tsx";
import { GlobalError } from "../src/app/global-error.tsx";
import { RouteLoading } from "../src/components/feedback/route-loading.tsx";
import { KiberBot } from "../src/components/kiberbot/kiberbot.tsx";

test("route loading renders a meaningful accessible status", () => {
  const html = renderToStaticMarkup(createElement(RouteLoading));

  assert.match(html, /role="status"/);
  assert.match(html, /Səhifə hazırlanır/);
});

test("route and global error fallbacks never render the supplied technical error", () => {
  const props = {
    error: new Error("Prisma SQL password=secret at localhost"),
    retry() {},
  };
  const routeHtml = renderToStaticMarkup(createElement(ErrorPage, props));
  const globalHtml = renderToStaticMarkup(createElement(GlobalError, props));

  for (const html of [routeHtml, globalHtml]) {
    assert.match(html, /Yenidən cəhd et/);
    assert.doesNotMatch(html, /Prisma|SQL|password|secret|localhost/i);
  }
});

test("KiberBot exposes a labelled fixed chat launcher and friendly introduction", () => {
  const html = renderToStaticMarkup(createElement(KiberBot));

  assert.match(html, /aria-label="KiberBot söhbətini aç"/);
  assert.match(html, /KiberBot/);
  assert.match(html, /kibertəhlükəsizlik suallarını yaza bilərsən/i);
});
