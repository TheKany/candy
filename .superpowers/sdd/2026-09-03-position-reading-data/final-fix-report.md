# Final review fix report

## Status

Completed the final Important-finding fix wave in the isolated `feature/position-reading-data` worktree. No push, deployment, live database migration, UI refactor, runtime AI integration, or secret access was performed.

## Files

- Added `supabase/migrations/202609030005_refine_position_readings.sql`.
- Added `util/tarotPositionReadingQuery.ts`.
- Added `tests/tarotPositionReadingQuery.test.ts`.
- Updated `app/api/threeCardReading/route.ts`.
- Updated `app/api/celticCrossReading/route.ts`.
- Updated `tests/tarotPositionReadingsSchema.test.ts`.
- Updated `tests/threeCardReading.test.ts`.
- Updated `tests/celticCrossReading.test.ts`.
- Added this report.

`202609030004_position_readings.sql` and the public result component shapes were intentionally left unchanged.

## Root causes verified

1. Migration 004 selected general `current_situation`, `cause`, or `advice` JSON values ahead of `topic_meaning` for future, blocker, HOLD, and opening summaries. It also led past summaries with unchanged source prose and supplied `''` as the non-career `concat_ws` input.
2. Migration 004 interpolated arbitrary position labels into Korean particle constructions such as `과거에서`, `현재에서는`, and `나에서`, and copied the same `topic_meaning` into both summary and detail.
3. The three-card and Celtic routes independently filtered `card_id`, `position_id`, and orientation. Those independent sets allowed PostgREST to return Cartesian supersets rather than only the selected card/position/orientation pairs.

## Decisions and implementation

### Migration 005

- Delivered corrections in the new, deterministic `202609030005_refine_position_readings.sql`; the already-applied migration 004 was not edited.
- Joined every existing position row to `tarot_card_profiles`, `tarot_base_interpretations`, and a complete 38-position fixed-phrase catalog.
- Rewrote all 47,424 rows. `GET DIAGNOSTICS ... ROW_COUNT` aborts unless exactly 47,424 rows were refined, and a separate final table-count guard aborts unless the chain still contains exactly 47,424 rows.
- Preserved source interpretation sentences as standalone `concat_ws` items. No arbitrary source sentence receives a Korean particle or suffix.
- Made past leads explicitly retrospective, present leads explicitly current, and future leads explicitly conditional/possible before including the topic meaning as its own sentence.
- Made blocker, HOLD, and opening summaries topic-first. Each role has eight distinct topic-specific condition sentences: what to stop or avoid, what evidence to verify, and what concrete condition permits movement.
- Replaced label-derived grammar with complete, position-specific Korean sentences for all 38 positions, including the relationship `self` position.
- Used SQL `NULL` for absent career scenes and `nullif(..., '')` for potentially blank source values. A topic-specific fallback sentence is paired with the card's one-line fallback if a topic JSON value is blank.
- Avoided repeating an identical `topic_meaning` in detail with `nullif(source.topic_detail, source.topic_meaning)`. Detail still receives a distinct topic scene, a suit-specific career scene where applicable, and a fixed position sentence.
- Kept career scenes concrete by suit: projects/initiative, colleagues/collaboration, evaluations/interviews/exams/conflict, skills/results/pay/grades, or role/direction changes for major arcana.

### Exact API tuple queries

- Added `buildPositionReadingTupleFilter`, which rejects empty input, invalid card IDs, unsafe position tokens, and invalid orientations before constructing a PostgREST expression.
- The helper emits one expression containing exact `and(card_id.eq.N,position_id.eq.ID,orientation.eq.VALUE)` tuples.
- Three-card routes construct exactly three ordered tuples. Celtic routes construct exactly ten ordered tuples with each selected card's own orientation.
- Both routes retain fixed topic, reading type, and layout filters, then apply the exact tuple expression with `.or(...)`. Independent position/card/orientation filters were removed from the primary position-reading queries.
- Existing profile queries, missing-position legacy fallback behavior, error statuses, composers, and response shapes remain unchanged.

## TDD evidence

Initial RED command:

```text
node --test --experimental-strip-types tests/tarotPositionReadingsSchema.test.ts tests/tarotPositionReadingQuery.test.ts tests/threeCardReading.test.ts tests/celticCrossReading.test.ts
```

Result: exit 1; 15 tests, 9 passed and 6 failed for the expected missing behaviors: migration 005 did not exist, the tuple helper did not exist, and both routes still used independent position filters.

Fallback-guarantee RED command:

```text
node --test --experimental-strip-types tests/tarotPositionReadingsSchema.test.ts
```

Result: exit 1; 5 tests, 4 passed and 1 failed because the eight-topic `topic_fallback_meaning` mapping did not yet exist.

Final focused GREEN command:

```text
node --test --experimental-strip-types tests/tarotPositionReadingsSchema.test.ts tests/tarotPositionReadingQuery.test.ts tests/threeCardReading.test.ts tests/celticCrossReading.test.ts
```

Result: exit 0; 16 passed, 0 failed. Node printed the pre-existing `MODULE_TYPELESS_PACKAGE_JSON` warning for TypeScript tests.

## Integration verification

Typecheck command:

```text
npm run typecheck
```

Result: exit 0; `tsc --noEmit` reported no errors. An earlier run correctly exposed ES2018-only regular-expression flags in the new test while this project targets ES2017; the flags were unnecessary because the patterns already used whitespace matching, so they were removed and the command was rerun successfully.

Build command:

```text
npm run build
```

Result: exit 0; Next.js 15.5.24 compiled, type-checked, generated all 18 static pages, and completed build traces. It printed the existing multiple-lockfile/output-root and missing-`metadataBase` warnings.

Additional read-only checks:

- Parsed migration 005's position catalog and compared it with `TAROT_READING_POSITIONS`: SQL count 38, TypeScript count 38, no missing keys, no extra keys.
- Scanned migration 005: no `과거에서`, `현재에서는`, or `나에서`; no non-career empty-string scene source; no runtime AI reference.
- Built a query with the installed Supabase client and inspected its URL search parameter. The helper output was serialized as one PostgREST `or=(and(...),and(...))` expression, preserving each tuple relationship.
- `git diff --cached --check` reported no whitespace errors across the complete staged fix, including this report.

## Self-review

- Re-read every binding requirement and Important finding against the complete fix diff.
- Confirmed the migration is additive, rerunnable to the same prose state, and guarded for both affected-row and final-row counts.
- Confirmed every summary includes a topic meaning and a complete role/position sentence; temporal leads express their own time role; all eight NO/HOLD/YES topic branches are present and distinct.
- Confirmed source prose is only joined as a standalone sentence, detail suppresses an exact summary-source duplicate, and optional spacing sources are `NULL`/`nullif` rather than empty strings.
- Confirmed the three-card primary query can match at most its three exact tuples and the Celtic primary query can match at most its ten exact tuples under the existing six-column uniqueness constraint.
- Confirmed no UI files, public result shapes, legacy fallback contracts, unrelated tests, configuration, or generated build output were changed.
- Confirmed no credential values were read or printed.

## Commit

Single commit subject: `fix: refine position readings and exact queries`.

The report is part of that commit, so it records the commit symbolically as `HEAD`; the immutable final hash is obtained immediately after commit and returned to the controller. A Git commit cannot embed its own final hash without changing that hash.

## Concerns

- Per the binding brief, migration 005 was not applied to the live database. Production data remains unchanged until the controller applies the new migration through the approved deployment path.
- No local PostgreSQL/Supabase executable was available, so SQL execution was not performed locally. Static migration contracts, exact 38-position parity, count guards, focused tests, typecheck, and build were verified; the migration will fail atomically if it cannot join and update exactly 47,424 rows.
- The existing Node module-type, Next.js multiple-lockfile/output-root, and `metadataBase` warnings remain outside this focused fix.
