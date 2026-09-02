# Tarot Interpretation Database Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the 100 local scan images into protected base interpretations and pre-generated topic readings for all 78 cards, store them in Supabase, and render the selected topic reading in the mobile result screen.

**Architecture:** Version the database schema and repeatable import tools in the repository, but keep the extracted interpretations and generated seed SQL in an ignored temporary folder that is removed after upload. Apply the schema and seed through the signed-in Supabase SQL editor, and query published readings only through a Next.js server route. The scan-derived base table remains private; the client receives a typed result or a one-line fallback.

**Tech Stack:** Next.js 15, TypeScript, styled-components, Supabase PostgreSQL/RLS, Node.js data validation scripts

**Spec:** `docs/superpowers/specs/2026-09-03-tarot-interpretation-database-design.md`

## Global Constraints

- Use exactly three domain tables: `tarot_card_profiles`, `tarot_base_interpretations`, and `tarot_topic_readings`.
- Store 78 profiles, 78 base interpretations, and 1,248 topic readings.
- Current app requests `orientation = 'upright'`; reversed content is stored for future use.
- Do not expose scan-derived base interpretations to browser clients.
- Do not call AI at application runtime.
- Store interpretation content in Supabase only; do not commit extracted JSON or generated seed SQL.
- Keep checks limited to row counts, required fields, uniqueness, one normal route response, one fallback response, typecheck, and the 280px result layout.
- Keep `images/` out of Git and remove it only after database and app verification succeeds.

---

### Task 1: Supabase schema and access policies

**Files:**
- Create: `supabase/migrations/202609030001_tarot_interpretations.sql`
- Test: `tests/tarotInterpretationSchema.test.ts`

**Interfaces:**
- Produces: the three tables, `tarot_orientation` enum, foreign keys, unique constraints, indexes, update timestamps, and RLS policies used by all later tasks.
- Access contract: anonymous clients may select profiles and topic readings; no anonymous policy exists for base interpretations; writes remain unavailable to anonymous clients.

- [ ] **Step 1: Write the schema contract test**

Read the migration as text and assert that it defines the three required tables, enables RLS on all three, grants public `SELECT` only through policies for profiles and topic readings, and declares `unique (card_id, topic_id, orientation)`.

Run: `npm test -- --test-name-pattern="tarot interpretation schema"`
Expected: FAIL because the migration does not exist.

- [ ] **Step 2: Create the migration**

Define `card_id smallint primary key check (card_id between 0 and 77)`, JSONB direction fields with required-object checks, text arrays for keywords, the eight allowed topic IDs, non-empty text checks for published reading fields, cascading foreign keys, and `updated_at` triggers. Enable RLS and create only the read policies described in the access contract.

- [ ] **Step 3: Run the focused test**

Run: `npm test -- --test-name-pattern="tarot interpretation schema"`
Expected: PASS.

- [ ] **Step 4: Apply the migration in the signed-in Supabase SQL editor**

Open the migration file, execute it in project `bbxuxalrlqhcwfvcypde`, and confirm all three tables appear without exposing `tarot_base_interpretations` to the anonymous role.

- [ ] **Step 5: Commit**

```powershell
git add -- supabase/migrations/202609030001_tarot_interpretations.sql tests/tarotInterpretationSchema.test.ts
git commit -m "feat: add tarot interpretation schema"
```

### Task 2: Scan-derived dataset and deterministic validation

**Files:**
- Create temporarily: `.tarot-import/card-profiles.json`
- Create temporarily: `.tarot-import/base-interpretations.json`
- Create temporarily: `.tarot-import/topic-readings.json`
- Create: `scripts/validate-tarot-data.mjs`
- Modify: `package.json`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `TarotCardProfile[]` with 78 items, `TarotBaseInterpretation[]` with 78 items, and `TarotTopicReading[]` with 1,248 items.
- The validator exits with code 0 only when IDs 0–77 are complete, all required strings are non-empty, source filenames exist in the base rows, and `(card_id, topic_id, orientation)` keys are unique and complete.

- [ ] **Step 1: Add the data validator before creating the datasets**

Ignore `.tarot-import/`. Implement `npm run validate:tarot-data` to load its three JSON files and report exact count, missing-field, invalid-ID, and duplicate-key failures.

Run: `npm run validate:tarot-data`
Expected: FAIL because the datasets do not exist.

- [ ] **Step 2: Build and inspect the five-card checkpoint**

Map and visually read the scan pages for card IDs `0`, `22`, `36`, `50`, and `64`. Write complete upright/reversed base objects, keywords, one-line meanings, and all eight topic readings per orientation using the approved warm, concrete counseling tone. Confirm the source filenames point to the actual scan pages.

- [ ] **Step 3: Complete the remaining 73 cards**

Process Major Arcana in ascending `IMG_6714.JPG` order and each 14-card suit in natural number/court order. Rephrase source meaning rather than copying scan prose. Each topic reading must contain `headline`, `core_message`, `emotional_layer`, `hidden_context`, `challenge`, `opportunity`, `near_future`, `advice`, and `reflection_question`.

- [ ] **Step 4: Validate the complete dataset**

Run: `npm run validate:tarot-data`
Expected: PASS with `profiles=78 base=78 readings=1248`.

- [ ] **Step 5: Commit without the scans**

```powershell
git add -- .gitignore scripts/validate-tarot-data.mjs package.json
git commit -m "feat: add complete tarot interpretation dataset"
```

### Task 3: Idempotent import and database verification

**Files:**
- Create: `scripts/build-tarot-seed.mjs`
- Create temporarily: `.tarot-import/tarot-interpretations.sql`
- Modify: `package.json`

**Interfaces:**
- Consumes: the three validated JSON arrays from Task 2.
- Produces: one transaction containing `INSERT ... ON CONFLICT DO UPDATE` statements in profile, base, then topic-reading order.

- [ ] **Step 1: Implement the seed builder**

Serialize JSON values with safe PostgreSQL dollar quoting and emit one transaction. Add `npm run build:tarot-seed` that regenerates `.tarot-import/tarot-interpretations.sql` from the ignored JSON files.

- [ ] **Step 2: Generate and inspect the seed**

Run: `npm run build:tarot-seed`
Expected: the output SQL contains 78 profile rows, 78 base rows, and 1,248 topic-reading rows and ends with `commit;`.

- [ ] **Step 3: Apply the seed in Supabase**

Execute `.tarot-import/tarot-interpretations.sql` in the signed-in SQL editor and run count, null-field, and duplicate-key queries. Expected counts are `78`, `78`, and `1248`, with zero invalid or duplicate rows.

- [ ] **Step 4: Verify access boundaries**

Using the project public key, confirm profiles and topic readings are selectable and base interpretations return no rows or a permission error.

- [ ] **Step 5: Commit**

```powershell
git add -- scripts/build-tarot-seed.mjs package.json
git commit -m "feat: add tarot interpretation seed"
```

### Task 4: Typed result API and mobile result presentation

**Files:**
- Create: `types/tarotReadingTypes.ts`
- Create: `app/api/tarotReading/route.ts`
- Modify: `components/result/OneCardResult.tsx`
- Test: `tests/tarotReadingRoute.test.ts`

**Interfaces:**
- Route: `GET /api/tarotReading?cardId=<0-77>&topicId=<TarotTopicId>&orientation=upright`
- Success response: `{ card: TarotCardProfile; reading: TarotTopicReading; fallback: false }`.
- Fallback response: `{ card: TarotCardProfile; reading: null; fallback: true }`, rendered with the card's one-line meaning and a neutral guidance sentence.
- Invalid query response: HTTP 400 with `{ error: string }`; unavailable database response: HTTP 503.

- [ ] **Step 1: Write two focused route tests**

Test one successful lookup and one missing-reading fallback using an injected/mock Supabase result. Do not add snapshots or exhaustive card/topic combinations.

Run: `npm test -- --test-name-pattern="tarot reading route"`
Expected: FAIL because the route does not exist.

- [ ] **Step 2: Add shared response types and the server route**

Validate `cardId`, `topicId`, and `orientation`, fetch the profile and topic reading, return the typed response contract, and log server details without returning them to the browser.

- [ ] **Step 3: Replace the legacy result requests**

Update `OneCardResult` to request the selected card and Zustand topic in one call. Render the headline, core message, emotion, hidden context, challenge, opportunity, near future, advice, and reflection question as readable sections. Render the one-line fallback when needed.

- [ ] **Step 4: Run focused verification**

Run: `npm test -- --test-name-pattern="tarot reading route"`
Expected: PASS.

Run: `npm run typecheck`
Expected: exit code 0.

- [ ] **Step 5: Verify the result screen at 280px**

Run the app, complete the one-card flow, confirm the selected topic's real Supabase reading appears, and check that the result screen has no horizontal overflow at 280px.

- [ ] **Step 6: Commit**

```powershell
git add -- types/tarotReadingTypes.ts app/api/tarotReading/route.ts components/result/OneCardResult.tsx tests/tarotReadingRoute.test.ts
git commit -m "feat: show topic-aware tarot results"
```

### Task 5: Final validation and scan removal

**Files:**
- Delete: `images/` after every earlier verification passes
- Delete: `.tarot-import/` after database verification passes

**Interfaces:**
- Consumes: verified Supabase counts and a successful 280px application flow.
- Produces: a repository workspace without the 100 source scans or temporary interpretation files; Supabase remains the only interpretation-content store.

- [ ] **Step 1: Run the minimal final checks**

Run: `npm run validate:tarot-data`
Expected: `profiles=78 base=78 readings=1248`.

Run: `npm test`
Expected: all focused project tests pass.

Run: `npm run typecheck`
Expected: exit code 0.

- [ ] **Step 2: Confirm the exact removal target**

Resolve `C:\Dev\01_project\tarot-app\images`, verify it remains inside the project, and confirm it contains exactly the 100 processed scan files.

- [ ] **Step 3: Remove the processed scans**

Delete only `C:\Dev\01_project\tarot-app\images` and `C:\Dev\01_project\tarot-app\.tarot-import`. Confirm `git status --short` no longer reports `?? images/` and that application assets under `public/cards/` remain intact.
