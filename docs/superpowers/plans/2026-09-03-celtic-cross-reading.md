# Celtic Cross Reading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a mobile-first Celtic Cross flow in which users directly select ten cards, receive stable randomized upright/reversed orientations, and read a 12-page position-aware result.

**Architecture:** Extend the existing type/topic/shuffle/result pipeline instead of adding a new wizard. Keep the ten position definitions and deterministic composition in code, store only per-reading orientation state in Zustand, and query the existing Supabase profile/topic tables through one Celtic Cross API route.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Zustand, styled-components, Supabase, Node test runner

**Spec:** `docs/superpowers/specs/2026-09-03-celtic-cross-reading-design.md`

## Global Constraints

- Support viewport widths down to exactly 280px without horizontal overflow or overlapping controls.
- Reuse `tarot_card_profiles`, `tarot_base_interpretations`, and `tarot_topic_readings`; do not add a table or seed dataset.
- Do not call an AI service at runtime.
- Assign one stable `upright` or `reversed` orientation to each of the ten selected cards.
- Result pages move only through the bottom previous/next buttons; swipes and page-dot clicks stay disabled.
- Run only feature-relevant tests plus one final existing suite/typecheck/build pass.
- Preserve the current one-card and three-card flows.

---

### Task 1: Enable Celtic Cross in the existing reading flow

**Files:**
- Modify: `constants/tarotTypes.ts`
- Modify: `store/useTarotTypeStore.ts`
- Modify: `util/tarotFlow.ts`
- Modify: `tests/tarotTypes.test.ts`
- Modify: `tests/tarotFlow.test.ts`

**Interfaces:**
- Produces: `TarotType` accepts `"celtic"`.
- Produces: `getTarotSelectionAction("celtic")` returns `{ kind: "navigate", href: "/topic" }`.
- Preserves: only `"three"` requires `/spread`; Celtic Cross requires the existing topic step.

- [ ] **Step 1: Update the type-selection tests and flow-guard test**

Change the expected Celtic option to available and add these literal expectations:

```ts
assert.deepEqual(getTarotSelectionAction("celtic"), {
  kind: "navigate",
  href: "/topic",
});
assert.equal(getReadingFlowRedirect("celtic", null), "/topic");
assert.equal(getReadingFlowRedirect("celtic", "career"), null);
```

- [ ] **Step 2: Run the focused tests and verify the new expectations fail**

Run:

```powershell
node --test --experimental-strip-types tests/tarotTypes.test.ts tests/tarotFlow.test.ts
```

Expected: FAIL because Celtic Cross is unavailable and `TarotType` excludes `"celtic"`.

- [ ] **Step 3: Enable the type and topic route**

Set the Celtic option to `available: true`, include `"celtic"` in `TarotType`, and route both one-card and Celtic Cross to `/topic`:

```ts
export type TarotType = "one" | "three" | "celtic" | null;

if (id === "one" || id === "celtic") {
  return { kind: "navigate", href: "/topic" };
}
```

Keep `getReadingFlowRedirect`'s spread check exclusive to `type === "three"`.

- [ ] **Step 4: Run the focused tests and verify they pass**

Run the command from Step 2. Expected: all assertions pass.

- [ ] **Step 5: Commit the enabled flow**

```powershell
git add constants/tarotTypes.ts store/useTarotTypeStore.ts util/tarotFlow.ts tests/tarotTypes.test.ts tests/tarotFlow.test.ts
git commit -m "feat: enable celtic cross reading flow"
```

---

### Task 2: Select ten cards with stable orientations and position labels

**Files:**
- Create: `constants/celticCrossPositions.ts`
- Create: `store/useCardOrientationStore.ts`
- Modify: `util/cardSelectionFlow.ts`
- Modify: `components/shuffle/NumberPad.tsx`
- Create: `components/shuffle/CelticCrossPickBoard.tsx`
- Modify: `components/shuffle/PickCardBoard.tsx`
- Modify: `components/shuffle/TarotCardBoard.tsx`
- Modify: `app/shuffle/page.tsx`
- Modify: `util/handleResetStore.ts`
- Modify: `tests/cardSelectionFlow.test.ts`
- Create: `tests/celticCrossPositions.test.ts`

**Interfaces:**
- Produces: `CELTIC_CROSS_POSITIONS`, an ordered readonly array of ten `{ id, label, description }` objects.
- Produces: `getCelticCrossPosition(index: number)` returning the position or `null`.
- Produces: `getRandomOrientation(random?: () => number): TarotOrientation` with default `Math.random`.
- Produces: `useCardOrientationStore` with `orientations`, `addOrientation`, and `resetOrientations`.
- Changes: `getNextPositionLabel(type, spread, pickedCount)` returns Celtic labels for counts 0 through 9.
- Changes: `shouldOpenResultAfterReveal("celtic", pickedCount, true)` returns true only at ten revealed cards.

- [ ] **Step 1: Write position, orientation, and selection-count tests**

Add literal tests that protect the user-visible order and orientation boundary:

```ts
assert.deepEqual(
  CELTIC_CROSS_POSITIONS.map((position) => position.label),
  [
    "현재 상황", "장애물", "내면의 원인", "의식적인 바람", "지나간 영향",
    "다가오는 흐름", "나의 태도", "주변 환경", "희망과 두려움", "최종 흐름",
  ],
);
assert.equal(getRandomOrientation(() => 0.49), "upright");
assert.equal(getRandomOrientation(() => 0.5), "reversed");
assert.equal(getNextPositionLabel("celtic", null, 2), "내면의 원인");
assert.equal(shouldOpenResultAfterReveal("celtic", 9, true), false);
assert.equal(shouldOpenResultAfterReveal("celtic", 10, true), true);
```

- [ ] **Step 2: Run the focused tests and verify they fail**

```powershell
node --test --experimental-strip-types tests/celticCrossPositions.test.ts tests/cardSelectionFlow.test.ts
```

Expected: FAIL because the Celtic position and orientation exports do not exist.

- [ ] **Step 3: Add the position definitions and orientation store**

Use stable IDs:

```ts
export const CELTIC_CROSS_POSITIONS = [
  { id: "present", label: "현재 상황", description: "질문의 중심과 지금 작동하는 핵심 에너지" },
  { id: "obstacle", label: "장애물", description: "현재 상황을 가로막거나 밀어붙이는 영향" },
  { id: "root", label: "내면의 원인", description: "무의식과 아직 드러나지 않은 원인" },
  { id: "goal", label: "의식적인 바람", description: "알고 있는 목표와 기대" },
  { id: "past", label: "지나간 영향", description: "현재에 남아 있는 과거의 영향" },
  { id: "near-future", label: "다가오는 흐름", description: "가까운 시기의 변화와 전개" },
  { id: "self", label: "나의 태도", description: "상황을 대하는 자세와 선택 방식" },
  { id: "environment", label: "주변 환경", description: "상대와 외부 조건의 영향" },
  { id: "hopes-fears", label: "희망과 두려움", description: "기대와 불안이 만드는 긴장" },
  { id: "outcome", label: "최종 흐름", description: "현재 선택이 이어질 때의 가능성" },
] as const;

export const getRandomOrientation = (
  random: () => number = Math.random,
): TarotOrientation => random() < 0.5 ? "upright" : "reversed";
```

The Zustand store appends exactly one orientation when a valid new card is confirmed and clears both on reading reset.

- [ ] **Step 4: Extend pure selection rules for Celtic Cross**

Read `CELTIC_CROSS_POSITIONS[pickedCount]?.label` when `type === "celtic"`. Add the ten-card boundary to `shouldOpenResultAfterReveal` while leaving one-card and three-card branches unchanged.

- [ ] **Step 5: Implement the compact Celtic selection board**

`CelticCrossPickBoard` renders ten absolute-positioned slots inside a board no wider than `248px`. Slot 2 is horizontal; slots 1 and 2 overlap; 3/4/5/6 form the central cross; 7–10 form the right staff. Each slot registers its center through the existing `setSlotPosition(index, { top, left })` contract and displays its number and short label.

In `PickCardBoard`, render this component only for `type === "celtic"`; preserve the existing one- and three-column boards for other types.

- [ ] **Step 6: Assign orientation only after a valid number confirmation**

In `NumberPad`, cap Celtic selections at ten and call:

```ts
addOrientation(getRandomOrientation());
```

immediately beside `setInput` and `setRealCard`. Do not assign a direction for empty, duplicate, or out-of-range input. Reuse the position label in the typing header.

- [ ] **Step 7: Scale and orient cards after they reach Celtic slots**

In `TarotCardBoard`, read the type and orientation list. For Celtic cards, use `scale(0.55)` in the destination transform so ten selected cards fit the compact board; add `rotate(90deg)` for selected order 2 so the crossing card matches its slot. Rotate the front image 180 degrees when its stored orientation is `reversed`; do not change the existing left-to-right `rotateY` reveal.

- [ ] **Step 8: Unlock after each reveal and route after the tenth**

Keep the current `selectionLocked` lifecycle. `handleCardRevealComplete` unlocks after cards 1–9 and calls `router.replace("/result")` only after card 10 finishes revealing.

- [ ] **Step 9: Run focused tests and typecheck**

```powershell
node --test --experimental-strip-types tests/celticCrossPositions.test.ts tests/cardSelectionFlow.test.ts
npm run typecheck
```

Expected: focused tests and TypeScript pass.

- [ ] **Step 10: Commit the Celtic selection experience**

```powershell
git add constants/celticCrossPositions.ts store/useCardOrientationStore.ts util/cardSelectionFlow.ts components/shuffle/NumberPad.tsx components/shuffle/CelticCrossPickBoard.tsx components/shuffle/PickCardBoard.tsx components/shuffle/TarotCardBoard.tsx app/shuffle/page.tsx util/handleResetStore.ts tests/cardSelectionFlow.test.ts tests/celticCrossPositions.test.ts
git commit -m "feat: add celtic cross card selection"
```

---

### Task 3: Compose and serve ten position-aware readings

**Files:**
- Create: `types/celticCrossReadingTypes.ts`
- Create: `util/celticCrossReading.ts`
- Create: `app/api/celticCrossReading/route.ts`
- Create: `tests/celticCrossReading.test.ts`

**Interfaces:**
- Consumes: `CELTIC_CROSS_POSITIONS`, ten `TarotCardProfile` records, ten `TarotOrientation` values, and ten nullable `TarotTopicReading` records in selected order.
- Produces: `buildCelticCrossReading(cards, orientations, readings): CelticCrossReadingResult`.
- Produces: `GET /api/celticCrossReading?cardId=...&orientation=...&topicId=...` with ten repeated card IDs and ten matching orientations.

Define the result contract:

```ts
export type CelticCrossReadingPage = {
  positionId: string;
  positionLabel: string;
  positionDescription: string;
  card: TarotCardProfile;
  orientation: TarotOrientation;
  headline: string;
  summary: string;
  detail: string;
  reflectionQuestion: string;
  fallback: boolean;
};

export type CelticCrossReadingResult = {
  conclusion: string;
  coreConflict: string;
  innerGap: string;
  timeline: string;
  outerInfluence: string;
  advice: string;
  pages: CelticCrossReadingPage[];
};
```

- [ ] **Step 1: Write composition tests using ten complete local fixtures**

Create ten distinct profile fixtures and readings with literal field values. Alternate orientations and assert:

```ts
assert.equal(result.pages.length, 10);
assert.equal(result.pages[0].positionLabel, "현재 상황");
assert.equal(result.pages[1].summary, readings[1]!.challenge);
assert.equal(result.pages[2].summary, readings[2]!.hidden_context);
assert.equal(result.pages[5].summary, readings[5]!.near_future);
assert.equal(result.pages[9].orientation, "reversed");
assert.match(result.coreConflict, /현재 상황/);
assert.match(result.timeline, /다가오는 흐름/);
```

Add one null reading and assert only that page has `fallback: true` and uses the card's one-line text for its assigned orientation.

- [ ] **Step 2: Run the composition test and verify it fails**

```powershell
node --test --experimental-strip-types tests/celticCrossReading.test.ts
```

Expected: FAIL because the builder and result types do not exist.

- [ ] **Step 3: Implement the position-content mapping**

Map stored reading fields by position:

```ts
const POSITION_FIELDS = {
  present: ["core_message", "emotional_layer"],
  obstacle: ["challenge", "hidden_context"],
  root: ["hidden_context", "emotional_layer"],
  goal: ["opportunity", "core_message"],
  past: ["hidden_context", "core_message"],
  "near-future": ["near_future", "opportunity"],
  self: ["emotional_layer", "advice"],
  environment: ["hidden_context", "challenge"],
  "hopes-fears": ["emotional_layer", "challenge"],
  outcome: ["near_future", "opportunity"],
} as const;
```

Use each page's own orientation for keyword and fallback selection. Compose `conclusion`, the four grouped sections, and `advice` from position labels, keywords, and stored advice without claiming an immutable future.

- [ ] **Step 4: Run the composition test and verify it passes**

Run the Step 2 command. Expected: all assertions pass.

- [ ] **Step 5: Implement API validation and Supabase queries**

Reject unless there are exactly ten unique integer IDs from 0–77, exactly ten orientations from `upright|reversed`, and one valid topic. Query profiles with `.in("card_id", cardIds)`. Query topic readings with:

```ts
.in("card_id", cardIds)
.eq("topic_id", topicId)
.in("orientation", ["upright", "reversed"])
```

Restore selected order by matching both `card_id` and the orientation at the same array index. Missing topic rows become `null`; missing profiles return 404; query failures return 500; missing Supabase configuration returns 503.

- [ ] **Step 6: Run the focused test and typecheck**

```powershell
node --test --experimental-strip-types tests/celticCrossReading.test.ts
npm run typecheck
```

Expected: composition test and TypeScript pass.

- [ ] **Step 7: Commit the reading API and composer**

```powershell
git add types/celticCrossReadingTypes.ts util/celticCrossReading.ts app/api/celticCrossReading/route.ts tests/celticCrossReading.test.ts
git commit -m "feat: compose celtic cross readings"
```

---

### Task 4: Add the 12-page mobile result and finish integration

**Files:**
- Create: `components/result/CelticCrossResult.tsx`
- Modify: `app/result/page.tsx`
- Modify: `util/handleResetStore.ts`
- Modify: `tests/horizontalResultPager.test.ts`

**Interfaces:**
- Consumes: ten card IDs, ten stable orientations, selected topic, and `CelticCrossReadingResult`.
- Reuses: `getNavigationButtonTarget(currentPage, direction, pageCount)` with `pageCount = 12`.
- Produces: overview page 0, card pages 1–10, and synthesis page 11.

- [ ] **Step 1: Extend the pager boundary test to 12 pages**

Add literal assertions:

```ts
assert.equal(getNavigationButtonTarget(0, "previous", 12), 0);
assert.equal(getNavigationButtonTarget(0, "next", 12), 1);
assert.equal(getNavigationButtonTarget(10, "next", 12), 11);
assert.equal(getNavigationButtonTarget(11, "next", 12), 11);
```

- [ ] **Step 2: Run the pager test and verify it passes before UI reuse**

```powershell
node --test --experimental-strip-types tests/horizontalResultPager.test.ts
```

Expected: PASS, proving the existing navigation primitive supports the new page count without modification.

- [ ] **Step 3: Implement loading and request guards in `CelticCrossResult`**

If card IDs, orientations, or topic are incomplete, render a card-selection recovery message. Otherwise append ten `cardId` and ten `orientation` parameters and request `/api/celticCrossReading`. Preserve the existing abort-controller cleanup and user-facing error pattern from `ThreeCardResult`.

- [ ] **Step 4: Implement the approved 12-page layout**

Use one clipped horizontal track with twelve 100%-width slides:

- Page 1: compact traditional cross/staff map, number labels, direction labels, and ten-item two-column legend.
- Pages 2–11: position, card image, `정방향|역방향`, headline, summary, detail, reflection question.
- Page 12: conclusion first, then core conflict, inner gap, timeline, outer influence, and final advice.

Reverse a card image with `transform: rotate(180deg)`. Render card 2 horizontally in the overview but show a text direction badge so its reversal is unambiguous. Use `clamp()`, `minmax(0, 1fr)`, and a maximum shell width of `480px`; at 280px the board itself must remain at most `248px`.

- [ ] **Step 5: Restrict all result movement to bottom buttons**

Do not attach touch or pointer handlers to the viewport. Render page dots as `span`, not `button`. Previous and next call `getNavigationButtonTarget`; on page 12 replace next with the existing home reset callback.

- [ ] **Step 6: Route Celtic result rendering and reset orientations**

In `app/result/page.tsx`, select components explicitly:

```tsx
type === "three" ? (
  <ThreeCardResult onHome={onClickHome} />
) : type === "celtic" ? (
  <CelticCrossResult onHome={onClickHome} />
) : (
  <OneCardResult />
)
```

Ensure both card-progress reset and full reset call `resetOrientations()`.

- [ ] **Step 7: Run feature tests, typecheck, and production build**

```powershell
node --test --experimental-strip-types tests/tarotTypes.test.ts tests/tarotFlow.test.ts tests/cardSelectionFlow.test.ts tests/celticCrossPositions.test.ts tests/celticCrossReading.test.ts tests/horizontalResultPager.test.ts
npm run typecheck
npm run build
```

Expected: relevant tests pass, typecheck exits 0, and Next.js build exits 0.

- [ ] **Step 8: Perform one 280px browser pass**

Verify this single path: select Celtic Cross → choose a topic → wait for shuffle → choose ten distinct positions → confirm the compact slots do not overlap controls → confirm reversed cards are visible → use only previous/next through all 12 result pages → return home. Tapping or swiping the result body must not change pages.

- [ ] **Step 9: Run the final existing suite once**

```powershell
npm test
```

Expected: all existing and new tests pass with zero failures. Ignore only the existing `MODULE_TYPELESS_PACKAGE_JSON` warning.

- [ ] **Step 10: Commit, push, and verify production**

```powershell
git add components/result/CelticCrossResult.tsx app/result/page.tsx util/handleResetStore.ts tests/horizontalResultPager.test.ts
git commit -m "feat: add celtic cross results"
git push origin master
```

Confirm the Vercel deployment is Ready, then request `/api/celticCrossReading` with ten unique card IDs, ten orientations, and a valid topic. Expect HTTP 200, ten pages, and the synthesis fields. Confirm the public result bundle contains the Celtic Cross UI and no touch-swipe handler.
