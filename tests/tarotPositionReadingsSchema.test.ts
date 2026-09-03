import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { TAROT_READING_POSITIONS } from "../constants/tarotReadingPositions.ts";

const migrationPath = new URL(
  "../supabase/migrations/202609030004_position_readings.sql",
  import.meta.url,
);

test("defines exactly 38 unique positions across the supported reading types", () => {
  const positionsByType = Object.groupBy(
    TAROT_READING_POSITIONS,
    ({ readingType }) => readingType,
  );
  const keys = TAROT_READING_POSITIONS.map(
    ({ readingType, layoutId, positionId }) =>
      `${readingType}:${layoutId}:${positionId}`,
  );

  assert.equal(TAROT_READING_POSITIONS.length, 38);
  assert.equal(new Set(keys).size, 38);
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(positionsByType).map(([readingType, positions]) => [
        readingType,
        positions?.length ?? 0,
      ]),
    ),
    { one: 1, three: 15, celtic: 10, horoscope: 12 },
  );
});

test("creates publicly readable position readings with a guarded complete seed", () => {
  const migration = readFileSync(migrationPath, "utf8");

  assert.match(
    migration,
    /unique\s*\(\s*card_id\s*,\s*topic_id\s*,\s*orientation\s*,\s*reading_type\s*,\s*layout_id\s*,\s*position_id\s*\)/i,
  );
  assert.match(migration, /alter table tarot_position_readings enable row level security/i);
  assert.match(
    migration,
    /create policy "position readings are publicly readable"[\s\S]*?for select[\s\S]*?to anon, authenticated[\s\S]*?using \(true\)/i,
  );
  assert.match(
    migration,
    /if \(select count\(\*\) from tarot_position_readings\) <> 47424 then[\s\S]*?raise exception 'Expected 47424 position readings'/i,
  );
});

test("keeps sentence-valued source prose separate from position grammar", () => {
  const migration = readFileSync(migrationPath, "utf8");
  const summaryGrammar = migration.match(
    /  case role\n(?<body>[\s\S]*?)\n  end,\n  concat_ws/,
  );

  assert.ok(summaryGrammar?.groups?.body);
  assert.doesNotMatch(summaryGrammar.groups.body, /format\([^)]*coalesce\(/);
  assert.match(summaryGrammar.groups.body, /when 'past' then concat_ws\('/);
});
