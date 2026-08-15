import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { NextRequest } from "next/server";

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-publishable-key";

mock.module("@supabase/ssr", {
  namedExports: {
    createServerClient() {
      return {
        auth: {
          async getUser() {
            return { data: { user: { id: "signed-in-user" } } };
          },
        },
      };
    },
  },
});

const { proxy } = await import("../src/proxy.ts");

test("a signed-in visitor can open the public landing page", async () => {
  const response = await proxy(new NextRequest("http://localhost:3000/"));

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("location"), null);
});
