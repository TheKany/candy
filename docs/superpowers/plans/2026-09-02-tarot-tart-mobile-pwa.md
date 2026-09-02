# Tarot Tart Mobile PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current menu-style home page with a polished mobile landing page and a separate tarot-type selection page, while completing the minimum installable PWA foundation and preserving the existing one-oracle flow.

**Architecture:** Keep `/` as a presentation-only landing route and add `/select` as the only place that decides whether a tarot type navigates or shows a preparation notice. Put type metadata and the selection decision in a pure typed module so it can be tested without a browser, and keep the existing Zustand selection store as the compatibility boundary with `/shuffle`. Register a small native service worker from the root layout instead of adding a PWA framework dependency.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, styled-components 6, Zustand 5, Node 24 built-in test runner, native Web App Manifest and Service Worker APIs

**Spec:** `docs/superpowers/specs/2026-09-02-tarot-tart-mobile-pwa-design.md`

## Global Constraints

- Support viewport widths from exactly 280px through common mobile widths of 320px, 375px, and 430px without horizontal scrolling, overlap, or clipped controls.
- Preserve the existing `/shuffle` and `/result` one-oracle behavior and interpretation data.
- Use the existing `public/main.png`, dark green background, gold accents, cream text, and local `NotoSerifKR` fonts.
- Only `원 오라클` navigates; `쓰리카드`, `켈틱 크로스`, and `호로스코프` remain on `/select` and announce `준비 중이에요`.
- Do not add a third-party PWA dependency or change Supabase data, environment variables, authentication, billing, or Vercel project settings.
- All primary controls have at least a 44px touch target, visible keyboard focus, meaningful accessible names, and reduced-motion behavior.
- Keep the user-owned untracked `images/` directory out of all commits.

---

### Task 1: Typed tarot selection contract

**Files:**
- Create: `constants/tarotTypes.ts`
- Create: `tests/tarotTypes.test.ts`
- Modify: `package.json`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: no runtime state; this is a pure product configuration module
- Produces: `TarotTypeId`, `TarotTypeOption`, `TarotSelectionAction`, `TAROT_TYPES`, and `getTarotSelectionAction(id)` for the `/select` route

- [ ] **Step 1: Write the failing selection-contract test**

```ts
// tests/tarotTypes.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  TAROT_TYPES,
  getTarotSelectionAction,
} from "../constants/tarotTypes.ts";

test("exposes the four tarot types in product order", () => {
  assert.deepEqual(
    TAROT_TYPES.map(({ id, title, subtitle, available }) => ({
      id,
      title,
      subtitle,
      available,
    })),
    [
      { id: "one", title: "원 오라클", subtitle: "힌트 찾기", available: true },
      { id: "three", title: "쓰리카드", subtitle: "직관적인 답", available: false },
      { id: "celtic", title: "켈틱 크로스", subtitle: "마음 들여다보기", available: false },
      { id: "horoscope", title: "호로스코프", subtitle: "내 전체 흐름", available: false },
    ],
  );
});

test("routes one oracle and returns a notice for unavailable readings", () => {
  assert.deepEqual(getTarotSelectionAction("one"), {
    kind: "navigate",
    href: "/shuffle",
  });
  assert.deepEqual(getTarotSelectionAction("three"), {
    kind: "notice",
    message: "준비 중이에요",
  });
});
```

- [ ] **Step 2: Add the test scripts and verify the test fails**

Add these scripts to `package.json` without removing the existing scripts:

```json
"test": "node --test --experimental-strip-types tests/*.test.ts",
"typecheck": "tsc --noEmit"
```

Run: `npm test`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `constants/tarotTypes.ts`.

- [ ] **Step 3: Implement the pure selection contract**

```ts
// constants/tarotTypes.ts
export type TarotTypeId = "one" | "three" | "celtic" | "horoscope";

export type TarotTypeOption = {
  id: TarotTypeId;
  title: string;
  subtitle: string;
  symbol: string;
  available: boolean;
};

export type TarotSelectionAction =
  | { kind: "navigate"; href: "/shuffle" }
  | { kind: "notice"; message: "준비 중이에요" };

export const TAROT_TYPES = [
  { id: "one", title: "원 오라클", subtitle: "힌트 찾기", symbol: "☾", available: true },
  { id: "three", title: "쓰리카드", subtitle: "직관적인 답", symbol: "Ⅲ", available: false },
  { id: "celtic", title: "켈틱 크로스", subtitle: "마음 들여다보기", symbol: "✦", available: false },
  { id: "horoscope", title: "호로스코프", subtitle: "내 전체 흐름", symbol: "☼", available: false },
] as const satisfies readonly TarotTypeOption[];

export function getTarotSelectionAction(
  id: TarotTypeId,
): TarotSelectionAction {
  return id === "one"
    ? { kind: "navigate", href: "/shuffle" }
    : { kind: "notice", message: "준비 중이에요" };
}
```

Append `/.superpowers/` to `.gitignore` so Visual Companion session files never enter product commits.

- [ ] **Step 4: Run unit and type checks**

Run: `npm test`

Expected: 2 tests pass.

Run: `npm run typecheck`

Expected: exit code 0.

- [ ] **Step 5: Commit the selection contract**

```bash
git add .gitignore package.json constants/tarotTypes.ts tests/tarotTypes.test.ts
git commit -m "feat: define tarot reading selection contract"
```

---

### Task 2: Mobile brand landing page

**Files:**
- Create: `constants/homeContent.ts`
- Create: `tests/homeContent.test.ts`
- Create: `components/home/HomeLanding.tsx`
- Modify: `app/page.tsx`
- Modify: `components/_common/_Container.tsx`
- Modify: `components/_common/_Wrapper.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `public/main.png`, Next.js `Image` and `Link`, the existing root `Container`
- Produces: `HOME_CONTENT` and a presentation-only `HomeLanding` component rendered at `/`

- [ ] **Step 1: Write the failing landing-copy test**

```ts
// tests/homeContent.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import { HOME_CONTENT } from "../constants/homeContent.ts";

test("defines the approved landing content and destination", () => {
  assert.deepEqual(HOME_CONTENT, {
    eyebrow: "TAROT TARTE",
    title: "타로타르트",
    description: "달콤하게 꺼내 보는 당신의 마음 한 조각",
    cta: "시작하기",
    href: "/select",
  });
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `node --test --experimental-strip-types tests/homeContent.test.ts`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `constants/homeContent.ts`.

- [ ] **Step 3: Add the landing content and responsive component**

```ts
// constants/homeContent.ts
export const HOME_CONTENT = {
  eyebrow: "TAROT TARTE",
  title: "타로타르트",
  description: "달콤하게 꺼내 보는 당신의 마음 한 조각",
  cta: "시작하기",
  href: "/select",
} as const;
```

Implement `components/home/HomeLanding.tsx` as a client-free component with this semantic structure:

```tsx
<Main>
  <Eyebrow>{HOME_CONTENT.eyebrow}</Eyebrow>
  <Hero>
    <Artwork>
      <Image
        src="/main.png"
        alt="달과 별 타로 카드가 꽂힌 베리 타르트"
        width={1024}
        height={1024}
        priority
        sizes="(max-width: 430px) 76vw, 320px"
      />
    </Artwork>
    <Title>{HOME_CONTENT.title}</Title>
    <Description>{HOME_CONTENT.description}</Description>
  </Hero>
  <StartLink href={HOME_CONTENT.href}>
    {HOME_CONTENT.cta}<span aria-hidden>✦</span>
  </StartLink>
</Main>
```

Use styled-components with these exact layout rules:

- `Main`: `min-height: 100dvh`, column flex, `padding` using all four safe-area insets, and vertical overflow safety.
- `Hero`: flexible center region; never assign a fixed height.
- `Artwork`: `width: clamp(176px, 72vw, 320px)` and `aspect-ratio: 1`.
- `Title`: `font-size: clamp(2rem, 12vw, 3rem)`.
- `StartLink`: minimum 52px height, gold gradient, 16px radius, full available width.
- At `max-width: 319px`, reduce outer padding to 14px and artwork width to `min(68vw, 190px)`.
- Under `prefers-reduced-motion: reduce`, disable transform and transition effects.

Replace `app/page.tsx` with a server component that only renders `<HomeLanding />`; remove the total-user fetch and old menu from the landing route.

Refine the shared shell:

```css
/* components/_common/_Container.tsx intent */
width: 100%;
max-width: 480px;
min-height: 100dvh;
margin: 0 auto;
overflow-x: hidden;
background: #0c3427;
```

Remove the old short-height media rule that forces `width: 600px` and `height: 1200px`. Make the route animation wrapper and its `Box` inherit minimum height, and remove the blanket 8px padding/background from `Box` so each route owns its safe spacing. In `globals.css`, change `width: 100vw` to `width: 100%`, retain `max-width`, set `overflow-x: hidden`, and remove the forced dark color-scheme declaration.

- [ ] **Step 4: Run tests and production type checks**

Run: `npm test`

Expected: 3 tests pass.

Run: `npm run typecheck`

Expected: exit code 0.

- [ ] **Step 5: Commit the landing page**

```bash
git add constants/homeContent.ts tests/homeContent.test.ts components/home/HomeLanding.tsx app/page.tsx components/_common/_Container.tsx components/_common/_Wrapper.tsx app/globals.css
git commit -m "feat: redesign tarot tart mobile landing"
```

---

### Task 3: Tarot type selection screen

**Files:**
- Create: `components/home/TarotTypeCard.tsx`
- Create: `components/home/ReadingSelect.tsx`
- Create: `app/select/page.tsx`
- Create: `tests/selectRoute.test.ts`
- Delete: `components/home/MenuButton.tsx`

**Interfaces:**
- Consumes: `TAROT_TYPES`, `getTarotSelectionAction`, `TarotTypeOption`, `useTarotTypeStore.setType`, and Next.js router methods
- Produces: `/select`, `TarotTypeCard({ option, onSelect })`, one-oracle navigation, and an accessible preparation notice

- [ ] **Step 1: Extend the selection test with all unavailable IDs**

Add to `tests/tarotTypes.test.ts`:

```ts
test("keeps every unfinished spread on the selection screen", () => {
  for (const id of ["three", "celtic", "horoscope"] as const) {
    assert.deepEqual(getTarotSelectionAction(id), {
      kind: "notice",
      message: "준비 중이에요",
    });
  }
});
```

Also add the route-level accessibility contract:

```ts
// tests/selectRoute.test.ts
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("selection route exposes the approved interactive structure", async () => {
  const [page, selection, card] = await Promise.all([
    readFile("app/select/page.tsx", "utf8"),
    readFile("components/home/ReadingSelect.tsx", "utf8"),
    readFile("components/home/TarotTypeCard.tsx", "utf8"),
  ]);

  assert.match(page, /<ReadingSelect\s*\/>/);
  assert.match(selection, /role="status"/);
  assert.match(selection, /aria-live="polite"/);
  assert.match(selection, /router\.back\(\)/);
  assert.match(card, /<button/);
  assert.match(card, /aria-label=/);
});
```

- [ ] **Step 2: Run the focused test**

Run: `node --test --experimental-strip-types tests/tarotTypes.test.ts`

Expected: the unavailable-type assertion passes, then the route contract FAILS with `ENOENT` for `app/select/page.tsx`.

- [ ] **Step 3: Implement the presentational tarot card**

`TarotTypeCard` must accept this interface and contain no router or store access:

```ts
type TarotTypeCardProps = {
  option: TarotTypeOption;
  onSelect: (id: TarotTypeId) => void;
};
```

Render a real `<button type="button">` with the symbol, title, em-dash subtitle, an arrow only when available, and a `준비 중` badge otherwise. Use `aria-label={`${option.title}, ${option.subtitle}${option.available ? "" : ", 준비 중"}`}`. Style it with a minimum 88px height, a 16px radius, visible `:focus-visible`, and a single-column layout that still leaves title copy at least 150px at a 280px viewport.

- [ ] **Step 4: Implement selection behavior and route composition**

`ReadingSelect` is the only client component in the new route. Use this decision logic:

```tsx
const [notice, setNotice] = useState("");
const router = useRouter();
const setType = useTarotTypeStore((state) => state.setType);

const handleSelect = (id: TarotTypeId) => {
  const action = getTarotSelectionAction(id);

  if (action.kind === "navigate") {
    setType("one");
    router.push(action.href);
    return;
  }

  setNotice(action.message);
};
```

Render the notice in a stable `<p role="status" aria-live="polite">` region so repeat selections are announced without layout shift. The back control must be a real button with `aria-label="이전 화면으로 돌아가기"` and call `router.back()`; provide a `<Link href="/">홈으로</Link>` fallback in the page structure for direct visits with no useful history.

`app/select/page.tsx` renders `<ReadingSelect />` and exports route metadata with title `타로 유형 선택 | 타로타르트`.

Match the approved mockup: dark green gradient, `CHOOSE YOUR READING` eyebrow, gold card symbols, cream type, and stacked cards. Use `clamp()` spacing and the same 280px breakpoint rules as the landing page.

- [ ] **Step 5: Run tests, type checks, and an unused-component search**

Run: `npm test`

Expected: 5 tests pass.

Run: `npm run typecheck`

Expected: exit code 0.

Run: `rg "MenuButton" app components`

Expected before deletion: only `components/home/MenuButton.tsx` remains because the new landing no longer imports it. Delete the unused file, run the same command again, and expect no matches.

- [ ] **Step 6: Commit the selection screen**

```bash
git add app/select/page.tsx components/home/TarotTypeCard.tsx components/home/ReadingSelect.tsx components/home/MenuButton.tsx tests/tarotTypes.test.ts tests/selectRoute.test.ts
git commit -m "feat: add tarot reading selection screen"
```

---

### Task 4: Installable PWA foundation and offline fallback

**Files:**
- Create: `tests/pwaAssets.test.ts`
- Create: `components/_common/PwaRegister.tsx`
- Create: `public/sw.js`
- Create: `public/offline.html`
- Create: `public/icons/icon-192.png`
- Create: `public/icons/icon-512.png`
- Modify: `app/manifest.json`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: browser `navigator.serviceWorker`, the existing 192px icon, and public brand assets
- Produces: `/manifest.json`, `/sw.js`, `/offline.html`, 192px and 512px icons, and production-only service-worker registration

- [ ] **Step 1: Write the failing PWA asset-contract test**

```ts
// tests/pwaAssets.test.ts
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("manifest declares the installable tarot tart identity", async () => {
  const manifest = JSON.parse(await readFile("app/manifest.json", "utf8"));
  assert.equal(manifest.name, "타로타르트");
  assert.equal(manifest.short_name, "타로타르트");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.scope, "/");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.theme_color, "#0c3427");
  assert.deepEqual(
    manifest.icons.map((icon: { sizes: string }) => icon.sizes),
    ["192x192", "512x512"],
  );
});

test("required offline and icon assets exist", async () => {
  await Promise.all([
    access("public/sw.js"),
    access("public/offline.html"),
    access("public/icons/icon-192.png"),
    access("public/icons/icon-512.png"),
  ]);
});

test("service worker excludes APIs and supplies an offline navigation fallback", async () => {
  const worker = await readFile("public/sw.js", "utf8");
  assert.match(worker, /tarot-tart-v1/);
  assert.match(worker, /request\.mode\s*===\s*["']navigate["']/);
  assert.match(worker, /\/offline\.html/);
  assert.match(worker, /\/api\//);
});
```

- [ ] **Step 2: Run the PWA test to verify it fails**

Run: `node --test --experimental-strip-types tests/pwaAssets.test.ts`

Expected: FAIL because `scope`, the 512px icon declaration, and the public PWA assets are absent.

- [ ] **Step 3: Generate branded public icons and complete the manifest**

Resize `app/android-icon-192x192.png` to both public icon sizes with PowerShell `System.Drawing`. This is a deterministic asset conversion, not a generated redesign:

```powershell
Add-Type -AssemblyName System.Drawing
$source = [System.Drawing.Image]::FromFile((Resolve-Path "app/android-icon-192x192.png"))
New-Item -ItemType Directory -Force "public/icons" | Out-Null
foreach ($size in @(192, 512)) {
  $bitmap = New-Object System.Drawing.Bitmap($size, $size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.DrawImage($source, 0, 0, $size, $size)
  $bitmap.Save((Join-Path (Resolve-Path "public/icons") "icon-$size.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
}
$source.Dispose()
```

Set `app/manifest.json` to this contract:

```json
{
  "name": "타로타르트",
  "short_name": "타로타르트",
  "description": "달콤하게 꺼내 보는 당신의 마음 한 조각",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#0c3427",
  "theme_color": "#0c3427",
  "lang": "ko-KR",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

- [ ] **Step 4: Implement the service worker and offline document**

`public/sw.js` must use cache version `tarot-tart-v1`, precache `/`, `/select`, `/offline.html`, `/main.png`, `/cardBack.png`, and both public icons, delete older `tarot-tart-*` caches during activation, and call `self.clients.claim()`.

For `fetch` events:

- Ignore non-GET and cross-origin requests.
- For `request.mode === "navigate"`, try `fetch(request)` first, cache successful same-origin responses, then fall back to the requested cached page and finally `/offline.html`.
- For images and fonts, return a cached response first and cache successful network responses.
- Do not cache `/api/` responses.

`public/offline.html` must be a standalone Korean document using inline CSS only, with the title `연결이 잠시 끊겼어요`, text explaining that cached screens remain available, and a button linking to `/`.

- [ ] **Step 5: Register the worker without affecting development**

```tsx
// components/_common/PwaRegister.tsx
"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (
      process.env.NODE_ENV === "production" &&
      "serviceWorker" in navigator
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  return null;
}
```

Render `<PwaRegister />` once in `app/layout.tsx`, remove the unused `url` import, set `metadata.manifest` to `/manifest.json`, and add `themeColor: "#0c3427"` to the exported viewport configuration.

- [ ] **Step 6: Run PWA tests, dimensions check, and type checks**

Run: `npm test`

Expected: 8 tests pass.

Run an image-dimension check and confirm exact outputs:

```text
public/icons/icon-192.png  192x192
public/icons/icon-512.png  512x512
```

Run: `npm run typecheck`

Expected: exit code 0.

- [ ] **Step 7: Commit the PWA foundation**

```bash
git add tests/pwaAssets.test.ts components/_common/PwaRegister.tsx public/sw.js public/offline.html public/icons/icon-192.png public/icons/icon-512.png app/manifest.json app/layout.tsx
git commit -m "feat: complete tarot tart PWA foundation"
```

---

### Task 5: Production build and mobile regression verification

**Files:**
- Modify only files implicated by a verified build or viewport defect

**Interfaces:**
- Consumes: completed `/`, `/select`, existing `/shuffle`, manifest, service worker, and offline assets
- Produces: a build-verified and viewport-verified change set with no known regression in the one-oracle entry flow

- [ ] **Step 1: Run the complete automated verification**

Run:

```bash
npm test
npm run typecheck
npm run build
```

Expected: every command exits with code 0. Do not continue past a failure; diagnose it, add or tighten the relevant test, and apply the smallest scoped correction.

- [ ] **Step 2: Start the production server and verify route responses**

Run: `npm start`

Verify these requests return HTTP 200:

```text
/
/select
/shuffle
/manifest.json
/sw.js
/offline.html
/icons/icon-192.png
/icons/icon-512.png
```

- [ ] **Step 3: Inspect exact mobile viewports in the in-app browser**

At 280x653, 320x568, 375x812, and 430x932:

- Confirm no horizontal scrollbar on `/` or `/select`.
- Confirm the title, illustration, description, and start button do not overlap or clip.
- Confirm all four selection cards remain readable and at least 44px tall.
- Confirm visible keyboard focus on start, back, home fallback, and every type button.
- Confirm reduced-motion mode removes nonessential transforms.

- [ ] **Step 4: Verify product behavior and the existing flow**

- Click `시작하기`; expect `/select`.
- Click each unavailable type; expect the page to remain `/select` and announce `준비 중이에요`.
- Click `원 오라클`; expect the Zustand value `one` and navigation to `/shuffle`.
- Complete a representative shuffle entry check far enough to see the existing card board load.
- Use browser back from `/select`; expect `/`.

- [ ] **Step 5: Verify PWA behavior in a production context**

- Confirm `/manifest.json` is linked from the document head.
- Confirm the service worker reaches `activated` and controls a reload.
- Switch the browser offline after one online visit; expect cached `/` and `/select` to load.
- Request an uncached same-origin route offline; expect `/offline.html` content.
- Confirm `/api/` responses are absent from the service-worker cache.

- [ ] **Step 6: Review the diff and commit only verified corrections**

Run:

```bash
git diff --check
git status --short
git diff --stat
```

Confirm `images/` remains untracked and unstaged. If verification required code corrections, commit only those explicit paths:

```bash
git commit -m "fix: polish tarot tart mobile PWA"
```

If no corrections were needed, do not create an empty commit.
