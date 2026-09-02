import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationPath = new URL(
  "../supabase/migrations/202609030001_tarot_interpretations.sql",
  import.meta.url,
);

test("tarot interpretation schema protects base data and published keys", async () => {
  const sql = (await readFile(migrationPath, "utf8")).toLowerCase();

  for (const table of [
    "tarot_card_profiles",
    "tarot_base_interpretations",
    "tarot_topic_readings",
  ]) {
    assert.match(sql, new RegExp(`create table(?: if not exists)? ${table}`));
    assert.match(sql, new RegExp(`alter table ${table} enable row level security`));
  }

  assert.match(sql, /unique\s*\(card_id, topic_id, orientation\)/);
  assert.match(sql, /profiles are publicly readable/);
  assert.match(sql, /topic readings are publicly readable/);
  assert.doesNotMatch(sql, /base interpretations are publicly readable/);
});
