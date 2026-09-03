import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import { TAROT_READING_POSITIONS } from "../constants/tarotReadingPositions.ts";

const migrationPath = new URL(
  "../supabase/migrations/202609030004_position_readings.sql",
  import.meta.url,
);
const refinementMigrationPath = new URL(
  "../supabase/migrations/202609030005_refine_position_readings.sql",
  import.meta.url,
);

const readMigration = (path: URL) =>
  readFileSync(path, "utf8").replace(/\r\n?/g, "\n");

const readRefinementMigration = () => {
  assert.ok(
    existsSync(refinementMigrationPath),
    "migration 005 must refine the already-applied position readings",
  );

  return readMigration(refinementMigrationPath);
};

const extractTopicCaseBranches = (migration: string, alias: string) => {
  const endMarker = `end as ${alias}`;
  const endIndex = migration.indexOf(endMarker);

  assert.notEqual(endIndex, -1, `${alias} must be defined by a topic case`);
  const startIndex = migration.lastIndexOf("case topic_id", endIndex);
  assert.notEqual(startIndex, -1, `${alias} must start with case topic_id`);

  return [...migration.slice(startIndex, endIndex).matchAll(
    /when '([^']+)' then '([^']+)'/g,
  )].map(([, topicId, sentence]) => ({ topicId, sentence }));
};

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
  const migration = readMigration(migrationPath);

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
  const migration = readMigration(migrationPath);
  const summaryGrammar = migration.match(
    /  case role\n([\s\S]*?)\n  end,\n  concat_ws/,
  );
  const summaryGrammarBody = summaryGrammar?.[1];

  assert.ok(summaryGrammarBody);
  assert.doesNotMatch(summaryGrammarBody, /format\([^)]*coalesce\(/);
  assert.match(summaryGrammarBody, /when 'past' then concat_ws\('/);
});

test("refines all rows with topic-first direction prose and natural fixed position phrases", () => {
  const migration = readRefinementMigration();
  const summaryGrammar = migration.match(
    /summary\s*=\s*case source\.role([\s\S]*?)\n\s*end,\n\s*detail\s*=/i,
  );
  const summaryGrammarBody = summaryGrammar?.[1];

  assert.ok(summaryGrammarBody);
  assert.match(migration, /join tarot_card_profiles as profile on profile\.card_id = reading\.card_id/i);
  assert.match(migration, /join tarot_base_interpretations as base on base\.card_id = reading\.card_id/i);
  assert.match(migration, /update tarot_position_readings as reading/i);

  assert.match(
    summaryGrammarBody,
    /when 'blocker' then concat_ws\(\s*' ',\s*nullif\(source\.topic_meaning, ''\),\s*source\.blocker_condition/i,
  );
  assert.match(
    summaryGrammarBody,
    /when 'hold' then concat_ws\(\s*' ',\s*nullif\(source\.topic_meaning, ''\),\s*source\.hold_condition/i,
  );
  assert.match(
    summaryGrammarBody,
    /when 'opening' then concat_ws\(\s*' ',\s*nullif\(source\.topic_meaning, ''\),\s*source\.opening_condition/i,
  );
  assert.match(summaryGrammarBody, /when 'past' then concat_ws\(\s*' ',\s*source\.position_lead/i);
  assert.match(summaryGrammarBody, /when 'present' then concat_ws\(\s*' ',\s*source\.position_lead/i);
  assert.match(summaryGrammarBody, /when 'future' then concat_ws\(\s*' ',\s*source\.position_lead/i);

  assert.match(migration, /지나온 시간에는[^']*남겼어요\./);
  assert.match(migration, /지금[^']*드러나고 있어요\./);
  assert.match(migration, /가능성이 열릴 수 있어요\./);
  assert.match(migration, /내 마음과 태도가 지금 상황에 미치는 영향을 살펴보세요\./);
  assert.doesNotMatch(migration, /과거에서|현재에서는|나에서/);
  assert.doesNotMatch(migration, /when topic_id <> 'career' then ''/i);
  assert.match(migration, /else null\s+end as career_scene/i);
  assert.match(migration, /nullif\(source\.topic_detail, source\.topic_meaning\)/i);

  const topicIds = [
    "their-feelings",
    "new-love",
    "relationship-flow",
    "career",
    "money",
    "relationships",
    "decision",
    "personal-flow",
  ];
  for (const alias of [
    "blocker_condition",
    "hold_condition",
    "opening_condition",
    "topic_fallback_meaning",
  ]) {
    const branches = extractTopicCaseBranches(migration, alias);

    assert.deepEqual(branches.map(({ topicId }) => topicId), topicIds);
    assert.equal(new Set(branches.map(({ sentence }) => sentence)).size, 8);
  }
  assert.match(
    migration,
    /coalesce\(\s*nullif\(btrim\(raw_topic_meaning\), ''\),\s*concat_ws\(\s*' ',\s*nullif\(btrim\(fallback_line\), ''\),\s*topic_fallback_meaning/i,
  );
});

test("guards both the 47,424-row refinement and the final migration-chain count", () => {
  const migration = readRefinementMigration();

  assert.match(migration, /get diagnostics updated_row_count = row_count/i);
  assert.match(
    migration,
    /if updated_row_count <> 47424 then[\s\S]*?raise exception 'Expected to refine 47424 position readings'/i,
  );
  assert.match(
    migration,
    /if \(select count\(\*\) from tarot_position_readings\) <> 47424 then[\s\S]*?raise exception 'Expected 47424 position readings after refinement'/i,
  );
});
