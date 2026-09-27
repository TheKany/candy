import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
test("PWA는 인증/회원/결과 HTML을 캐시에 저장하지 않는다", async () => {
  const listeners: Record<string, (event: any) => void> = {};
  let writes = 0;
  const context = { URL, self: { location: { origin: "https://tarotart.vercel.app" }, addEventListener: (name: string, handler: any) => { listeners[name] = handler; } },
    fetch: async () => ({ ok: true, clone: () => ({}) }), caches: { open: async () => ({ put: async () => { writes++; } }), match: async () => undefined } };
  vm.runInNewContext(readFileSync(new URL("../public/sw.js", import.meta.url), "utf8"), context);
  for (const path of ["/auth/callback?code=secret", "/account", "/account/readings/123", "/result", "/"]) {
    let response: Promise<unknown> | undefined;
    listeners.fetch({ request: { method: "GET", url: `https://tarotart.vercel.app${path}`, mode: "navigate" }, respondWith: (value: Promise<unknown>) => { response = value; } });
    if (response) await response;
  }
  assert.equal(writes, 0);
});
