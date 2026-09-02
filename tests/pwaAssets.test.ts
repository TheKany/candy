import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";

const expectedIcons = [
  {
    src: "/icons/icon-192.png",
    sizes: "192x192",
    type: "image/png",
    purpose: "any maskable",
  },
  {
    src: "/icons/icon-512.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "any maskable",
  },
];

test("manifest supplies the installable tarot tart identity", async () => {
  const manifest = JSON.parse(await readFile("app/manifest.json", "utf8"));

  assert.deepEqual(manifest, {
    name: "타로타르트",
    short_name: "타로타르트",
    description: "달콤하게 꺼내 보는 당신의 마음 한 조각",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0c3427",
    theme_color: "#0c3427",
    lang: "ko-KR",
    icons: expectedIcons,
  });
});

test("public app icons retain their promised PNG dimensions", async () => {
  for (const [path, width, height] of [
    ["public/icons/icon-192.png", 192, 192],
    ["public/icons/icon-512.png", 512, 512],
  ] as const) {
    const png = await readFile(path);
    assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.equal(png.readUInt32BE(16), width);
    assert.equal(png.readUInt32BE(20), height);
  }
});

test("offline page explains the interruption and offers a home retry", async () => {
  const page = await readFile("public/offline.html", "utf8");

  assert.match(page, /<title>연결이 잠시 끊겼어요<\/title>/);
  assert.match(page, /<h1[^>]*>연결이 잠시 끊겼어요<\/h1>/);
  assert.match(page, /캐시된 화면/);
  assert.match(page, /<a[^>]+href=["']\/["'][^>]*>/);
});

test("service worker bypasses API requests and returns its offline page for failed navigation", async () => {
  type WorkerHandler = (event: {
    request: Request;
    respondWith: (response: Promise<Response> | Response) => void;
  }) => void;

  const originalSelf = globalThis.self;
  const originalCaches = globalThis.caches;
  const originalFetch = globalThis.fetch;
  const handlers = new Map<string, WorkerHandler>();

  const fakeSelf = {
    location: { origin: "https://tarot.example" },
    skipWaiting: async () => undefined,
    clients: { claim: async () => undefined },
    addEventListener(type: string, handler: WorkerHandler) {
      handlers.set(type, handler);
    },
  };

  try {
    globalThis.self = fakeSelf as unknown as typeof globalThis.self;
    globalThis.caches = {
      open: async () => ({ addAll: async () => undefined, put: async () => undefined }),
      keys: async () => [],
      delete: async () => true,
      match: async (request: Request | string) =>
        request === "/offline.html" ? new Response("offline") : undefined,
    } as unknown as CacheStorage;
    globalThis.fetch = async () => Promise.reject(new Error("offline"));

    await import(`${pathToFileURL(resolve("public/sw.js")).href}?test=${Date.now()}`);
    const fetchHandler = handlers.get("fetch");
    assert.ok(fetchHandler);

    let apiResponded = false;
    fetchHandler({
      request: new Request("https://tarot.example/api/cardData"),
      respondWith: () => {
        apiResponded = true;
      },
    });
    assert.equal(apiResponded, false);

    let navigationResponse: Promise<Response> | Response | undefined;
    fetchHandler({
      request: {
        url: "https://tarot.example/uncached",
        method: "GET",
        mode: "navigate",
      } as Request,
      respondWith: (response) => {
        navigationResponse = response;
      },
    });
    assert.ok(navigationResponse);
    assert.equal(await (await navigationResponse).text(), "offline");
  } finally {
    globalThis.self = originalSelf;
    globalThis.caches = originalCaches;
    globalThis.fetch = originalFetch;
  }
});
