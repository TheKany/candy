import assert from "node:assert/strict";
import test from "node:test";

const environmentNames = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
] as const;

test("returns null getters when Supabase configuration is absent or partial", async () => {
  const originalEnvironment = new Map(
    environmentNames.map((name) => [name, process.env[name]]),
  );

  try {
    for (const name of environmentNames) {
      delete process.env[name];
    }

    const { getSupabaseClient } = await import("../lib/supabaseClient.ts");
    const { getSupabaseServer } = await import("../lib/supabaseServer.ts");

    assert.equal(getSupabaseClient(), null);
    assert.equal(getSupabaseServer(), null);

    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    assert.equal(getSupabaseClient(), null);

    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.SUPABASE_URL = "https://example.supabase.co";
    assert.equal(getSupabaseServer(), null);
  } finally {
    for (const [name, value] of originalEnvironment) {
      if (value === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = value;
      }
    }
  }
});
