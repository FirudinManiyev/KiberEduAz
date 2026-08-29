import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("next/navigation", {
  namedExports: {
    useRouter() {
      return { refresh() {}, replace() {} };
    },
    useSearchParams() {
      return new URLSearchParams();
    },
  },
});

mock.module("sonner", {
  namedExports: {
    toast: {
      error() {},
      loading() {},
      success() {},
    },
  },
});

mock.module("../src/lib/api/client.ts", {
  namedExports: {
    async apiRequest() {
      throw new Error("apiRequest is not expected during static rendering");
    },
  },
});

mock.module("../src/lib/supabase/client.ts", {
  namedExports: {
    createSupabaseBrowserClient() {
      throw new Error("Supabase is not expected during static rendering");
    },
  },
});

const { AuthForm } = await import("../src/components/auth/auth-form.tsx");
const { Logo } = await import("../src/components/brand/logo.tsx");

test("the shared brand renders the supplied KiberEduAz logo asset", () => {
  const html = renderToStaticMarkup(createElement(Logo));

  assert.match(html, /kibereduaz_logo\.png/);
  assert.match(html, /alt="KiberEduAz — Kibertəhlükəsizlik Öyrənmə Platforması"/);
});

for (const mode of ["login", "register", "register-teacher"]) {
  test(`${mode} exposes a labelled link back to the landing page`, () => {
    const html = renderToStaticMarkup(createElement(AuthForm, { mode }));

    assert.match(
      html,
      /<a(?=[^>]*href="\/")(?=[^>]*aria-label="Ana səhifəyə qayıt")[^>]*>/,
    );
  });
}
