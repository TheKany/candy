# Three-Card Reading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a five-layout three-card flow with persistent position labels, combined interpretation, and a four-page horizontal result experience, then deploy it to Vercel.

**Architecture:** Reuse the existing topic, shuffle, and card-selection flow. Store only the selected spread ID; define spread positions in code, fetch the three existing topic readings in one API route, and compose position-aware and combined results without adding duplicated interpretation rows.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Zustand, styled-components, Supabase, Node test runner, Vercel

**Spec:** `docs/superpowers/specs/2026-09-03-three-card-reading-design.md`

## Global Constraints

- Keep the existing one-oracle flow unchanged.
- Support mobile widths down to 280px without horizontal overflow or overlapping labels.
- Do not add runtime AI calls or a large precomputed interpretation table.
- Show spread position labels in both empty selection slots and selected-card slots.
- Use horizontal swipe/buttons for the four result pages instead of a long vertical result.
- Add only focused tests for routing, role mapping, composition, and page bounds.

---

### Task 1: Spread definitions, state, and selection route

**Files:**
- Create: `constants/threeCardSpreads.ts`
- Create: `store/useThreeCardSpreadStore.ts`
- Create: `components/spread/ThreeCardSpreadSelection.tsx`
- Create: `app/spread/page.tsx`
- Modify: `constants/tarotTypes.ts`
- Modify: `util/tarotFlow.ts`
- Modify: `util/handleResetStore.ts`
- Test: `tests/threeCardSpreads.test.ts`
- Test: `tests/tarotTypes.test.ts`

**Interfaces:**
- Produces `ThreeCardSpreadId`, `ThreeCardPosition`, `THREE_CARD_SPREADS`, `getThreeCardSpread(value)`.
- Produces persisted store `{ spread, setSpread, resetSpread }`.
- `getReadingFlowRedirect(type, topic, spread)` may return `"/select" | "/spread" | "/topic" | null`.

- [ ] **Step 1: Write failing tests for the five spreads and routing**

```ts
assert.deepEqual(THREE_CARD_SPREADS.map(({ id }) => id), [
  "timeline", "problem", "relationship", "choice", "direction",
]);
assert.equal(getReadingFlowRedirect("three", null, null), "/spread");
assert.equal(getReadingFlowRedirect("three", null, "timeline"), "/topic");
assert.deepEqual(getTarotSelectionAction("three"), { kind: "navigate", href: "/spread" });
```

- [ ] **Step 2: Run the targeted tests and confirm they fail**

Run: `node --test --experimental-strip-types tests/threeCardSpreads.test.ts tests/tarotTypes.test.ts`

- [ ] **Step 3: Implement definitions, store, routing, and the single-select page**

Use three stable position IDs per spread and Korean labels from the approved spec. Enable the three-card type, set `type` from the selected ID, and navigate one-card to `/topic` and three-card to `/spread`. Reset the spread on full app reset.

- [ ] **Step 4: Run targeted tests and typecheck**

Run: `node --test --experimental-strip-types tests/threeCardSpreads.test.ts tests/tarotTypes.test.ts && npm run typecheck`

### Task 2: Position labels throughout card selection

**Files:**
- Modify: `components/shuffle/PickCardBoard.tsx`
- Modify: `components/shuffle/NumberPad.tsx`
- Modify: `app/shuffle/page.tsx`
- Modify: `util/tarotFlow.ts`
- Test: `tests/cardSelectionFlow.test.ts`

**Interfaces:**
- Consumes `getThreeCardSpread(spread)` and its ordered `positions`.
- Produces `getNextPositionLabel(type, spread, pickedCount): string` for the number pad prompt.

- [ ] **Step 1: Add failing tests for labels and three-card completion**

```ts
assert.equal(getNextPositionLabel("three", "timeline", 0), "과거");
assert.equal(getNextPositionLabel("three", "timeline", 2), "미래");
assert.equal(shouldOpenResultAfterReveal("three", 3, true), true);
```

- [ ] **Step 2: Run the targeted test and confirm it fails**

Run: `node --test --experimental-strip-types tests/cardSelectionFlow.test.ts`

- [ ] **Step 3: Render ordered labels in slots and the active label in the keypad**

Show `첫 번째 · 과거`, `두 번째 · 현재`, `세 번째 · 미래` for three-card slots. Keep the label visible after a card arrives. Pass the selected spread into routing protection so direct access without it returns to `/spread`.

- [ ] **Step 4: Run the targeted test and typecheck**

Run: `node --test --experimental-strip-types tests/cardSelectionFlow.test.ts && npm run typecheck`

### Task 3: Three-card reading composition and API

**Files:**
- Create: `types/threeCardReadingTypes.ts`
- Create: `util/threeCardReading.ts`
- Create: `app/api/threeCardReading/route.ts`
- Test: `tests/threeCardReading.test.ts`

**Interfaces:**
- `buildThreeCardReading(spread, cards, readings)` returns `{ spread, conclusion, flowSummary, advice, pages }`.
- Each item in `pages` contains `{ positionId, positionLabel, card, headline, summary, detail }`.
- GET accepts repeated `cardId`, plus `topicId`, `spreadId`, and `orientation`; it returns partial fallbacks for missing topic rows.

- [ ] **Step 1: Add failing tests for position-field mapping and connected conclusion**

```ts
assert.equal(result.pages[0].summary, readings[0].hidden_context); // timeline past
assert.equal(result.pages[1].summary, readings[1].core_message);   // timeline present
assert.equal(result.pages[2].summary, readings[2].near_future);    // timeline future
assert.match(result.conclusion, /과거/);
assert.match(result.conclusion, /현재/);
assert.match(result.conclusion, /미래/);
```

Also test the direction spread uses `challenge`, `hidden_context`, and `opportunity` for NO, 보류, and YES.

- [ ] **Step 2: Run the targeted test and confirm it fails**

Run: `node --test --experimental-strip-types tests/threeCardReading.test.ts`

- [ ] **Step 3: Implement deterministic composition and one Supabase route**

Query three profiles with `.in("card_id", cardIds)` and three topic rows with the same IDs, topic, and orientation. Restore the user's selected-card order after each query. Use profile one-line text as the per-card fallback and reject invalid, duplicate, or non-three-card requests with status 400.

- [ ] **Step 4: Run the targeted test and typecheck**

Run: `node --test --experimental-strip-types tests/threeCardReading.test.ts && npm run typecheck`

### Task 4: Four-page horizontal result

**Files:**
- Create: `components/result/ThreeCardResult.tsx`
- Create: `util/horizontalResultPager.ts`
- Modify: `app/result/page.tsx`
- Test: `tests/horizontalResultPager.test.ts`

**Interfaces:**
- `clampResultPage(index, pageCount)` keeps page index in `0..pageCount - 1`.
- Three-card result consumes the API response and owns one `activePage` shared by swipe gestures and buttons.

- [ ] **Step 1: Write failing pager boundary tests**

```ts
assert.equal(clampResultPage(-1, 4), 0);
assert.equal(clampResultPage(4, 4), 3);
assert.equal(clampResultPage(2, 4), 2);
```

- [ ] **Step 2: Run the targeted test and confirm it fails**

Run: `node --test --experimental-strip-types tests/horizontalResultPager.test.ts`

- [ ] **Step 3: Implement the responsive four-page carousel**

Render summary first and one card per remaining page. Add touch start/end handling with a 40px threshold, previous/next buttons, four accessible dot buttons, position labels directly below each card, and a final home button. Keep each page within the viewport at 280px using `min-width: 0`, `clamp()`, and compact spacing.

- [ ] **Step 4: Select the result component by tarot type and avoid duplicate global controls**

Render `OneCardResult` for `one` and `ThreeCardResult` for `three`. Keep feedback/count logging shared; show existing global home/share controls only for one-card because the three-card pager supplies its own final-page home action.

- [ ] **Step 5: Run the targeted test and typecheck**

Run: `node --test --experimental-strip-types tests/horizontalResultPager.test.ts && npm run typecheck`

### Task 5: Focused regression verification and production deployment

**Files:**
- Modify only files required by failures directly caused by Tasks 1–4.

- [ ] **Step 1: Run the existing focused suite**

Run: `npm test`
Expected: all tests pass with zero failures.

- [ ] **Step 2: Run compile and production build checks**

Run: `npm run typecheck && npm run build`
Expected: both commands exit 0.

- [ ] **Step 3: Commit and push**

```bash
git add app components constants store types util tests
git commit -m "feat: add three-card tarot reading"
git push origin master
```

- [ ] **Step 4: Verify Vercel and production API**

Confirm the pushed commit is `Ready` in Vercel and request `/api/threeCardReading` with three real card IDs, one topic, `timeline`, and `upright`. Verify the response has four result pages worth of data: one combined summary plus three ordered card pages.

