# Task 3 Report: Serve Stored Position Readings

## Files changed

- `app/api/tarotReading/route.ts`
- `app/api/threeCardReading/route.ts`
- `app/api/celticCrossReading/route.ts`
- `util/tarotReadingResult.ts`
- `tests/tarotReadingRoute.test.ts`
- `tests/threeCardReading.test.ts`
- `tests/celticCrossReading.test.ts`

## Decisions

- All three reading routes now query `tarot_position_readings` first and select only `TarotPositionReading`'s compact fields.
- The one-card route uses `one / single / message`; three-card uses `three / spread.id / spread position ids`; Celtic Cross uses `celtic / celtic-cross / all ten Celtic Cross position ids`.
- Position rows are matched back to the selected card and its exact position. Celtic Cross also matches each selection's individual orientation.
- If a position row is absent, the routes query `tarot_topic_readings` only for the missing card ids and adapt the legacy row to a compact position row at the route boundary. The composers receive no legacy union values.
- `buildTarotReadingResult` now accepts `TarotPositionReading | null`, closing the one-card type mismatch left by Task 2.
- Existing invalid-input, missing-profile, database-error, and missing-Supabase status responses are unchanged.

## Verification

Command:

```text
node --test --experimental-strip-types tests/tarotReadingRoute.test.ts tests/threeCardReading.test.ts tests/celticCrossReading.test.ts
```

Result: passed, 11 tests; 0 failures. Node emitted the existing module-type reparsing warning for TypeScript ESM test files.

Command:

```text
npm run typecheck
```

Result: failed before reporting task code issues because pre-existing `tests/tarotPositionReadingsSchema.test.ts:56` uses a named RegExp capture group while `tsconfig.json` targets ES2017 (`TS1503`).

## Self-review

- Confirmed each new contract test names the route-query mutation it catches and failed before route implementation changed.
- Confirmed the first query uses the required table and exact reading-type, layout, and position filters for every flow.
- Confirmed fallback is conditional on missing exact rows and conversion stays in route boundaries.
- Confirmed profile queries and the documented HTTP response paths remain unchanged.
- Confirmed only scoped task files are staged; the untracked `supabase/.temp/` directory is excluded.

## Commit

`df827a9a1e95efcd06d96fdfe395214cf7afa41e` — `feat: serve stored position readings`

## Concerns

- The earlier ES2017/named-capture error was resolved in a follow-up commit. Node still emits its pre-existing module-type reparsing warning while executing TypeScript ESM tests.

## Follow-up validation

The schema test's named capture group was replaced with an equivalent positional capture, preserving the same extracted migration body while remaining compatible with the project's ES2017 target.

Command:

```text
node --test --experimental-strip-types tests/tarotReadingRoute.test.ts tests/threeCardReading.test.ts tests/celticCrossReading.test.ts tests/tarotPositionReadingsSchema.test.ts
```

Result: passed, 14 tests; 0 failures. Node emitted the existing module-type reparsing warning for TypeScript ESM test files.

Command:

```text
npm run typecheck
```

Result: passed with exit code 0.
