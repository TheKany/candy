# Position-Specific Tarot Reading Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Store and serve all 47,424 card, orientation, topic, reading-layout, and position interpretations without runtime AI calls.

**Architecture:** A normalized `tarot_position_readings` table stores one compact reading for each of the 38 positions. A single position catalog is shared by the SQL seed and TypeScript lookup, while existing topic readings remain as a temporary fallback. Current result APIs query exact position rows; horoscope data is seeded now but its screen remains out of scope.

**Tech Stack:** Next.js 15, TypeScript, Supabase Postgres, styled-components, Node test runner

**Spec:** `docs/superpowers/specs/2026-09-03-position-reading-data-design.md`

## Global Constraints

- Do not add a user-situation selector.
- Store 47,424 rows: `78 cards × 2 orientations × 8 topics × 38 positions`.
- Do not call AI or a text-generation API at request time.
- Use warm, conversational Korean tarot-reader prose without keyword lists or formulaic numbered summaries.
- Keep horoscope UI out of scope; seed its twelve houses only.
- Add only focused tests required for the new schema and result behavior.

---

### Task 1: Position catalog and Supabase data

**Files:**
- Create: `constants/tarotReadingPositions.ts`
- Create: `supabase/migrations/202609030004_position_readings.sql`
- Test: `tests/tarotPositionReadingsSchema.test.ts`

**Interfaces:**
- Produces: `TAROT_READING_POSITIONS`, `getReadingPosition(readingType, layoutId, positionId)`
- Produces: `tarot_position_readings` with unique key `(card_id, topic_id, orientation, reading_type, layout_id, position_id)`

- [ ] **Step 1: Write the failing catalog and schema test**

Assert that the catalog contains exactly 38 unique positions distributed as `{ one: 1, three: 15, celtic: 10, horoscope: 12 }`. Read the migration text and assert that it defines the six-column unique key, enables public read-only RLS, and includes a post-seed count guard for 47,424 rows.

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `node --test --experimental-strip-types tests/tarotPositionReadingsSchema.test.ts`

Expected: FAIL because the catalog and migration do not exist.

- [ ] **Step 3: Define the 38-position catalog**

Export records with this shape:

```ts
export type TarotReadingPosition = {
  readingType: "one" | "three" | "celtic" | "horoscope";
  layoutId: string;
  positionId: string;
  label: string;
  role: "message" | "past" | "present" | "future" | "blocker" | "hold" | "opening" | "context" | "advice";
};
```

Use the existing five three-card layouts and ten Celtic positions verbatim. Define horoscope houses as `self`, `money`, `communication`, `home`, `creativity`, `routine`, `partnership`, `transformation`, `growth`, `career`, `community`, and `inner-world`.

- [ ] **Step 4: Create and seed the normalized table**

Create compact text columns `headline`, `summary`, `detail`, `advice`, and `reflection_question`. Build a 38-row SQL `position_definitions` CTE, cross join it with 78 profiles, two orientations, and eight topics, and upsert every resulting row.

Select the active JSON interpretation with:

```sql
case orientation.value
  when 'upright' then base.upright
  else base.reversed
end as meaning
```

Generate position-specific language by role. `past` must use past-tense endings, `present` current-tense endings, and `future` possibility/future endings. `blocker`, `hold`, and `opening` must explicitly describe what to avoid, verify, and proceed with. For `career`, append concrete scenes selected by card suit: wands use projects and initiative, cups use colleagues and collaboration, swords use evaluation/interviews/exams and conflict, pentacles use skills/results/pay/grades, and major arcana use role or direction changes. Keep all other topics grounded in their matching base JSON field.

End the migration with:

```sql
do $$
begin
  if (select count(*) from tarot_position_readings) <> 47424 then
    raise exception 'Expected 47424 position readings';
  end if;
end
$$;
```

- [ ] **Step 5: Run the focused test and commit**

Run: `node --test --experimental-strip-types tests/tarotPositionReadingsSchema.test.ts`

Commit: `feat: add position-specific tarot data`

### Task 2: Position-reading model and natural result composition

**Files:**
- Modify: `types/tarotReadingTypes.ts`
- Modify: `types/threeCardReadingTypes.ts`
- Modify: `types/celticCrossReadingTypes.ts`
- Modify: `util/threeCardReading.ts`
- Modify: `util/celticCrossReading.ts`
- Modify: `util/tarotResultPresentation.ts`
- Test: `tests/threeCardReading.test.ts`
- Test: `tests/celticCrossReading.test.ts`
- Test: `tests/tarotResultPresentation.test.ts`

**Interfaces:**
- Consumes: exact rows from `tarot_position_readings`
- Produces: `TarotPositionReading` and composition functions that preserve existing result component shapes

- [ ] **Step 1: Add failing behavior tests**

For the timeline spread, assert that the returned past page contains a past-tense ending, the present page describes a current state, and the future page uses possibility language. For the direction spread, assert that NO describes a blocker, HOLD describes something to verify, and YES describes a condition that opens movement. Assert conclusions begin with the practical answer rather than quoted keywords.

- [ ] **Step 2: Run the three focused test files and confirm failure**

Run: `node --test --experimental-strip-types tests/threeCardReading.test.ts tests/celticCrossReading.test.ts tests/tarotResultPresentation.test.ts`

- [ ] **Step 3: Add the compact reading type**

```ts
export type TarotPositionReading = {
  card_id: number;
  topic_id: TarotTopicId;
  orientation: TarotOrientation;
  reading_type: "one" | "three" | "celtic" | "horoscope";
  layout_id: string;
  position_id: string;
  headline: string;
  summary: string;
  detail: string;
  advice: string;
  reflection_question: string;
};
```

- [ ] **Step 4: Use stored position prose in all composers**

Map each selected card to its exact position row and pass through `headline`, `summary`, `detail`, and `reflection_question`. Build timeline conclusions from the three stored `summary` fragments in temporal order. Build direction conclusions as `현재 답은 조건부 YES/보류/NO에 가깝다` followed by the stored NO blocker, HOLD verification, and YES opening; do not count cards as votes. Celtic summaries use the stored position summaries and retain current 12-page UI output.

- [ ] **Step 5: Run focused tests and commit**

Run: `node --test --experimental-strip-types tests/threeCardReading.test.ts tests/celticCrossReading.test.ts tests/tarotResultPresentation.test.ts`

Commit: `feat: compose readings from stored positions`

### Task 3: Query exact position rows from current APIs

**Files:**
- Modify: `app/api/tarotReading/route.ts`
- Modify: `app/api/threeCardReading/route.ts`
- Modify: `app/api/celticCrossReading/route.ts`
- Test: `tests/tarotReadingRoute.test.ts`
- Test: `tests/threeCardReading.test.ts`
- Test: `tests/celticCrossReading.test.ts`

**Interfaces:**
- Consumes: `tarot_position_readings` and the position identifiers from existing selection stores
- Produces: unchanged public JSON shapes for `OneCardResult`, `ThreeCardResult`, and `CelticCrossResult`

- [ ] **Step 1: Add failing query-contract assertions**

Assert each route names `tarot_position_readings` and filters `reading_type`, `layout_id`, and the exact selected `position_id`. Keep legacy `tarot_topic_readings` only as a missing-row fallback.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `node --test --experimental-strip-types tests/tarotReadingRoute.test.ts tests/threeCardReading.test.ts tests/celticCrossReading.test.ts`

- [ ] **Step 3: Update the three API queries**

One oracle queries `one/single/message`. Three-card queries its chosen layout and the three position IDs. Celtic queries `celtic/celtic-cross` and all ten position IDs, then restores picked-card order and individual orientations before composition. Return existing error statuses for invalid input, missing Supabase configuration, failed queries, and missing profiles.

- [ ] **Step 4: Run focused tests and commit**

Run: `node --test --experimental-strip-types tests/tarotReadingRoute.test.ts tests/threeCardReading.test.ts tests/celticCrossReading.test.ts`

Commit: `feat: serve stored position readings`

### Task 4: Apply data and deploy

**Files:**
- Modify only if required by verification: files from Tasks 1–3

**Interfaces:**
- Produces: deployed database rows and production APIs backed by stored position readings

- [ ] **Step 1: Apply the migration to the linked Supabase project**

Use the repository's configured Supabase project and apply `202609030004_position_readings.sql`. Do not print credentials.

- [ ] **Step 2: Verify stored counts with one read-only query**

Expected counts:

```text
one       1,248
three    18,720
celtic   12,480
horoscope 14,976
total    47,424
```

- [ ] **Step 3: Run proportional local verification**

Run: `npm test`

Run: `npm run typecheck`

Run: `npm run build`

- [ ] **Step 4: Push and verify production**

Push `master`, wait for the Vercel Git deployment, and request one timeline and one direction API result. Confirm temporal wording, NO/HOLD/YES roles, and no runtime AI dependency.

- [ ] **Step 5: Report completion**

Report the migration count, local verification results, production URL, and final commit without adding unrelated cleanup work.
