# Tarot Topic Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a mobile-first, single-select tarot topic screen between reading-type selection and card shuffling, and preserve the selected topic through the result screen.

**Architecture:** Define the eight topics and selection action in a typed constants module, persist one topic ID in a focused Zustand session store, and compose a new `/topic` client screen from a page wrapper and selectable card UI. A small pure flow helper guards direct route access, while the existing result component only displays the selected topic label; topic-specific Supabase interpretation data remains outside this change.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, styled-components 6, Zustand 5, Node test runner

**Spec:** `docs/superpowers/specs/2026-09-03-tarot-topic-selection-design.md`

## Global Constraints

- Support viewport widths down to exactly 280px without horizontal overflow or overlapping controls.
- Use styled-components for all new screen styling.
- Permit exactly one selected topic at a time.
- Render no bottom navigation button while the topic is unselected.
- Do not change Supabase tables, APIs, reading copy, shuffle animation, or card selection animation.
- Do not stage or modify the user-owned untracked `images/` directory.
- Preserve all pre-existing uncommitted shuffle and card-selection work.

## File Map

- Create `constants/tarotTopics.ts`: topic IDs, display data, lookup validation, and conditional navigation action.
- Create `store/useTarotTopicStore.ts`: one persisted topic ID with set/reset actions.
- Create `tests/tarotTopics.test.ts`: exact topic catalog and selection-action behavior.
- Create `app/topic/page.tsx`: metadata and route entry point.
- Create `components/topic/TopicSelection.tsx`: complete selection screen, cards, selected feedback, and conditional CTA.
- Modify `constants/tarotTypes.ts`: route available tarot readings to `/topic`.
- Modify `tests/tarotTypes.test.ts`: lock the new route contract.
- Create `util/tarotFlow.ts`: pure direct-access redirect decision.
- Create `tests/tarotFlow.test.ts`: redirect rules.
- Modify `app/shuffle/page.tsx`: guard the shuffle route after client hydration.
- Modify `components/result/OneCardResult.tsx`: show the selected topic label.
- Modify `util/handleResetStore.ts`: separate card-progress reset from full reading reset so back navigation preserves type and topic.

---

### Task 1: Topic Domain Model and Selection Store

**Files:**
- Create: `constants/tarotTopics.ts`
- Create: `store/useTarotTopicStore.ts`
- Test: `tests/tarotTopics.test.ts`

**Interfaces:**
- Produces: `TarotTopicId`, `TarotTopicOption`, `TAROT_TOPICS`, `isTarotTopicId(value)`, `getTarotTopic(id)`, and `getTopicSelectionAction(id)`.
- Produces: `useTarotTopicStore` with `{ topic, setTopic, resetTopic }`.

- [ ] **Step 1: Write the failing topic catalog and action tests**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  TAROT_TOPICS,
  getTarotTopic,
  getTopicSelectionAction,
  isTarotTopicId,
} from "../constants/tarotTopics.ts";

test("exposes the eight tarot concerns once in display order", () => {
  assert.deepEqual(TAROT_TOPICS.map(({ id, title }) => ({ id, title })), [
    { id: "their-feelings", title: "상대의 마음" },
    { id: "new-love", title: "새로운 인연" },
    { id: "relationship-flow", title: "관계의 흐름" },
    { id: "career", title: "일·커리어" },
    { id: "money", title: "금전운" },
    { id: "relationships", title: "인간관계" },
    { id: "decision", title: "선택·결정" },
    { id: "personal-flow", title: "나의 흐름" },
  ]);
  assert.equal(new Set(TAROT_TOPICS.map(({ id }) => id)).size, 8);
});

test("validates and looks up persisted topic IDs", () => {
  assert.equal(isTarotTopicId("career"), true);
  assert.equal(isTarotTopicId("unknown"), false);
  assert.equal(getTarotTopic("career")?.title, "일·커리어");
  assert.equal(getTarotTopic(null), null);
});

test("hides navigation without a topic and opens shuffle with one", () => {
  assert.deepEqual(getTopicSelectionAction(null), { kind: "hidden" });
  assert.deepEqual(getTopicSelectionAction("career"), {
    kind: "navigate",
    href: "/shuffle",
  });
});
```

- [ ] **Step 2: Run the focused test and confirm the module is missing**

Run: `node --test --experimental-strip-types tests/tarotTopics.test.ts`

Expected: FAIL because `constants/tarotTopics.ts` does not exist.

- [ ] **Step 3: Implement the typed topic catalog and pure helpers**

```ts
export type TarotTopicId =
  | "their-feelings"
  | "new-love"
  | "relationship-flow"
  | "career"
  | "money"
  | "relationships"
  | "decision"
  | "personal-flow";

export type TarotTopicOption = {
  id: TarotTopicId;
  title: string;
  symbol: string;
};

export const TAROT_TOPICS = [
  { id: "their-feelings", title: "상대의 마음", symbol: "♡" },
  { id: "new-love", title: "새로운 인연", symbol: "✧" },
  { id: "relationship-flow", title: "관계의 흐름", symbol: "∞" },
  { id: "career", title: "일·커리어", symbol: "♜" },
  { id: "money", title: "금전운", symbol: "◇" },
  { id: "relationships", title: "인간관계", symbol: "☊" },
  { id: "decision", title: "선택·결정", symbol: "⇄" },
  { id: "personal-flow", title: "나의 흐름", symbol: "☾" },
] as const satisfies readonly TarotTopicOption[];

export const isTarotTopicId = (value: unknown): value is TarotTopicId =>
  TAROT_TOPICS.some(({ id }) => id === value);

export const getTarotTopic = (id: unknown): TarotTopicOption | null =>
  isTarotTopicId(id)
    ? TAROT_TOPICS.find((topic) => topic.id === id) ?? null
    : null;

export const getTopicSelectionAction = (id: TarotTopicId | null) =>
  id
    ? ({ kind: "navigate", href: "/shuffle" } as const)
    : ({ kind: "hidden" } as const);
```

- [ ] **Step 4: Implement the session-persisted store**

```ts
import { isTarotTopicId, type TarotTopicId } from "@/constants/tarotTopics";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type TarotTopicStore = {
  topic: TarotTopicId | null;
  setTopic: (topic: TarotTopicId) => void;
  resetTopic: () => void;
};

export const useTarotTopicStore = create<TarotTopicStore>()(
  persist(
    (set) => ({
      topic: null,
      setTopic: (topic) => set({ topic }),
      resetTopic: () => set({ topic: null }),
    }),
    {
      name: "tarot-topic",
      storage: createJSONStorage(() => sessionStorage),
      merge: (persisted, current) => {
        const saved = persisted as Partial<TarotTopicStore>;
        return {
          ...current,
          topic: isTarotTopicId(saved?.topic) ? saved.topic : null,
        };
      },
    },
  ),
);
```

- [ ] **Step 5: Run the focused test and typecheck**

Run: `node --test --experimental-strip-types tests/tarotTopics.test.ts`

Expected: 3 tests PASS.

Run: `npm run typecheck`

Expected: exit code 0.

- [ ] **Step 6: Commit only Task 1 files**

```powershell
git add -- constants/tarotTopics.ts store/useTarotTopicStore.ts tests/tarotTopics.test.ts
git commit -m "feat: add tarot topic selection state"
```

### Task 2: Mobile Topic Selection Screen

**Files:**
- Create: `app/topic/page.tsx`
- Create: `components/topic/TopicSelection.tsx`
- Modify: `constants/tarotTypes.ts`
- Modify: `tests/tarotTypes.test.ts`

**Interfaces:**
- Consumes: `TAROT_TOPICS`, `TarotTopicId`, `getTopicSelectionAction`, `useTarotTopicStore`, and `useTarotTypeStore`.
- Produces: `/topic` route and `/select -> /topic -> /shuffle` navigation.

- [ ] **Step 1: Change the route-contract test first**

Replace the expected one-card action in `tests/tarotTypes.test.ts` with:

```ts
assert.deepEqual(getTarotSelectionAction("one"), {
  kind: "navigate",
  href: "/topic",
});
```

- [ ] **Step 2: Run the route test and confirm the old `/shuffle` expectation fails**

Run: `node --test --experimental-strip-types tests/tarotTypes.test.ts`

Expected: FAIL showing actual `href: "/shuffle"`.

- [ ] **Step 3: Update the available tarot action to `/topic`**

In `constants/tarotTypes.ts`, change the navigate union and returned action:

```ts
export type TarotSelectionAction =
  | { kind: "navigate"; href: "/topic" }
  | { kind: "notice"; message: "준비 중이에요" };

if (id === "one") {
  return { kind: "navigate", href: "/topic" };
}
```

- [ ] **Step 4: Add the route entry with metadata**

```tsx
import TopicSelection from "@/components/topic/TopicSelection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "타로 주제 선택 | 타로타르트",
  description: "지금 가장 마음에 걸리는 고민 주제를 하나 골라보세요.",
};

export default function TopicPage() {
  return <TopicSelection />;
}
```

- [ ] **Step 5: Build the single-select client component**

Use this state and navigation structure in `components/topic/TopicSelection.tsx`:

```tsx
"use client";

import { TAROT_TOPICS, getTopicSelectionAction } from "@/constants/tarotTopics";
import { useTarotTopicStore } from "@/store/useTarotTopicStore";
import { useTarotTypeStore } from "@/store/useTarotTypeStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styled from "styled-components";

export default function TopicSelection() {
  const router = useRouter();
  const type = useTarotTypeStore((state) => state.type);
  const topic = useTarotTopicStore((state) => state.topic);
  const setTopic = useTarotTopicStore((state) => state.setTopic);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && !type) router.replace("/select");
  }, [mounted, router, type]);

  const continueToShuffle = () => {
    const action = getTopicSelectionAction(topic);
    if (action.kind === "navigate") router.push(action.href);
  };

  if (!mounted || !type) return null;

  return (
    <Main $hasSelection={topic !== null}>
      <TopBar>
        <BackButton type="button" onClick={() => router.back()}>← 뒤로</BackButton>
      </TopBar>
      <Header>
        <Eyebrow>CHOOSE YOUR CONCERN</Eyebrow>
        <Title>무엇이 가장 궁금한가요?</Title>
        <Description>지금 마음에 가장 가까운 주제를 하나 골라주세요.</Description>
      </Header>
      <TopicGrid aria-label="타로 고민 주제">
        {TAROT_TOPICS.map((option) => {
          const selected = option.id === topic;
          return (
            <TopicCard
              key={option.id}
              type="button"
              aria-pressed={selected}
              $selected={selected}
              onClick={() => setTopic(option.id)}
            >
              <Symbol aria-hidden>{option.symbol}</Symbol>
              <span>{option.title}</span>
              {selected && <Check aria-hidden>✓</Check>}
            </TopicCard>
          );
        })}
      </TopicGrid>
      {topic && (
        <CtaDock>
          <ContinueButton type="button" onClick={continueToShuffle}>
            이 주제로 타로 보기
          </ContinueButton>
        </CtaDock>
      )}
    </Main>
  );
}
```

Style the component with these exact behavioral constraints:

- `Main`: `min-height: 100dvh`, the existing deep-green/gold visual language, responsive horizontal padding of 10px at `max-width: 319px`, and conditional bottom padding of at least `104px + env(safe-area-inset-bottom)` only when selected.
- `TopicGrid`: two equal `minmax(0, 1fr)` columns and 10–12px gap at every supported width.
- `TopicCard`: minimum 96px height, centered symbol and label, `word-break: keep-all`, and no fixed width.
- Selected card: solid `#f2ce72` border, subtle gold background, inset ring, and an absolutely positioned check badge.
- `CtaDock`: fixed to the bottom of the app's centered 480px canvas, `width: min(100%, 480px)`, safe-area padding, and a short `fade/translateY` entrance.
- Reduced motion: disable transitions and the CTA entrance animation.
- Focus: use a visible cream outline on cards and navigation controls.

- [ ] **Step 6: Run focused tests and typecheck**

Run: `node --test --experimental-strip-types tests/tarotTopics.test.ts tests/tarotTypes.test.ts`

Expected: all tests PASS.

Run: `npm run typecheck`

Expected: exit code 0.

- [ ] **Step 7: Commit only Task 2 files**

```powershell
git add -- app/topic/page.tsx components/topic/TopicSelection.tsx constants/tarotTypes.ts tests/tarotTypes.test.ts
git commit -m "feat: add tarot topic selection screen"
```

### Task 3: Reading Flow Guards, Reset, and Result Context

**Files:**
- Create: `util/tarotFlow.ts`
- Create: `tests/tarotFlow.test.ts`
- Modify: `app/shuffle/page.tsx`
- Modify: `components/result/OneCardResult.tsx`
- Modify: `util/handleResetStore.ts`

**Interfaces:**
- Consumes: `TarotType`, `TarotTopicId`, `useTarotTopicStore`, and `getTarotTopic`.
- Produces: `getReadingFlowRedirect(type, topic): "/select" | "/topic" | null` and separate card-progress/full-reading reset functions.

- [ ] **Step 1: Write failing flow redirect tests**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { getReadingFlowRedirect } from "../util/tarotFlow.ts";

test("restores the earliest missing reading step", () => {
  assert.equal(getReadingFlowRedirect(null, null), "/select");
  assert.equal(getReadingFlowRedirect("one", null), "/topic");
  assert.equal(getReadingFlowRedirect("one", "career"), null);
});
```

- [ ] **Step 2: Run the focused test and confirm the helper is missing**

Run: `node --test --experimental-strip-types tests/tarotFlow.test.ts`

Expected: FAIL because `util/tarotFlow.ts` does not exist.

- [ ] **Step 3: Implement the pure redirect helper**

```ts
import type { TarotTopicId } from "@/constants/tarotTopics";
import type { TarotType } from "@/store/useTarotTypeStore";

export const getReadingFlowRedirect = (
  type: TarotType,
  topic: TarotTopicId | null,
): "/select" | "/topic" | null => {
  if (!type) return "/select";
  if (!topic) return "/topic";
  return null;
};
```

- [ ] **Step 4: Guard the shuffle route after the client store has mounted**

In `app/shuffle/page.tsx`, read `topic`, add a `mounted` state, and redirect before starting the data-loading effect:

```tsx
const topic = useTarotTopicStore((state) => state.topic);
const [mounted, setMounted] = useState(false);

useEffect(() => setMounted(true), []);
useEffect(() => {
  if (!mounted) return;
  const redirect = getReadingFlowRedirect(type, topic);
  if (redirect) router.replace(redirect);
}, [mounted, router, topic, type]);
```

Gate the card-count request with `if (!mounted || getReadingFlowRedirect(type, topic)) return;` so direct access does not begin the shuffle before redirecting.

- [ ] **Step 5: Separate back-navigation cleanup from full reading reset**

Refactor `util/handleResetStore.ts` so the shuffle page can clear only shuffled-card progress while the result Home button can clear the full reading:

```ts
import { useTarotTopicStore } from "@/store/useTarotTopicStore";

export const handleResetCardProgress = () => {
  usePickCardStoreSlotStore.getState().resetSlotPositions();
  useShuffleTypeStore.getState().resetShuffleStep();
  useUserPickNum.getState().reset();
};

export const handleResetStore = () => {
  handleResetCardProgress();
  useTarotTypeStore.getState().resetType();
  useTarotTopicStore.getState().resetTopic();
  useUserSelectAnswer.getState().resetAnswer();
};
```

Change `app/shuffle/page.tsx` to call `useResetData(handleResetCardProgress)`. This preserves the selected tarot type and topic when the user navigates back to `/topic`, while still clearing positions and picked cards. Keep `app/result/page.tsx` and the result Home button on the full `handleResetStore` function.

- [ ] **Step 6: Display topic context without changing interpretation data**

In `components/result/OneCardResult.tsx`, obtain the selected topic and render a small heading before `Box`:

```tsx
const topicId = useTarotTopicStore((state) => state.topic);
const topic = getTarotTopic(topicId);

{topic && <TopicLabel>선택한 주제 · {topic.title}</TopicLabel>}
```

Style `TopicLabel` as centered dark-green text with a compact gold-bordered pill. Do not alter either fetch URL or the reading merge logic.

- [ ] **Step 7: Run focused and full checks**

Run: `node --test --experimental-strip-types tests/tarotFlow.test.ts tests/tarotTopics.test.ts tests/tarotTypes.test.ts`

Expected: all focused tests PASS.

Run: `npm test`

Expected: all repository tests PASS.

Run: `npm run typecheck`

Expected: exit code 0.

- [ ] **Step 8: Commit only Task 3 files**

```powershell
git add -- util/tarotFlow.ts tests/tarotFlow.test.ts app/shuffle/page.tsx components/result/OneCardResult.tsx util/handleResetStore.ts
git commit -m "feat: carry tarot topic through reading flow"
```

### Task 4: Browser Verification at Mobile Widths

**Files:**
- No source files expected unless visual verification exposes a defect in the files from Tasks 2–3.

**Interfaces:**
- Consumes: completed `/select`, `/topic`, `/shuffle`, and `/result` flow.
- Produces: visual and behavioral evidence at 280px and a normal mobile width.

- [ ] **Step 1: Open `/select` at 280px and choose 원 오라클**

Expected: URL becomes `/topic`; no horizontal overflow is visible.

- [ ] **Step 2: Verify the unselected topic screen**

Expected: all eight cards appear in two columns, none is selected, and `이 주제로 타로 보기` is absent.

- [ ] **Step 3: Select two topics in succession**

Expected: only the latest card has the gold border, changed background, check badge, and `aria-pressed="true"`; the previous card returns to its default state.

- [ ] **Step 4: Verify the conditional CTA and next route**

Expected: the CTA appears only after selection, does not cover the final row, and navigates to `/shuffle`.

- [ ] **Step 5: Verify back navigation and flow recovery**

Expected: returning to `/topic` preserves the selected card; opening `/shuffle` after clearing session topic redirects to `/topic`.

- [ ] **Step 6: Repeat the core selection at 390px**

Expected: the centered layout remains within the 480px app canvas and the two-column cards and bottom button remain balanced.

- [ ] **Step 7: Re-run final checks after any visual adjustment**

Run: `npm test`

Expected: all repository tests PASS.

Run: `npm run typecheck`

Expected: exit code 0.
