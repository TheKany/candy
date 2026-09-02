import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const importRoot = path.join(projectRoot, ".tarot-import");

const [profiles, baseInterpretations, topicReadings] = await Promise.all([
  loadJson("card-profiles.json"),
  loadJson("base-interpretations.json"),
  loadJson("topic-readings.json"),
]);

function loadJson(filename) {
  return readFile(path.join(importRoot, filename), "utf8").then(JSON.parse);
}

function quote(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function nullable(value) {
  return value === null ? "null" : quote(value);
}

function textArray(values) {
  return `array[${values.map(quote).join(", ")}]::text[]`;
}

const profileValues = profiles.map((profile) => `(
  ${profile.card_id}, ${quote(profile.name_ko)}, ${quote(profile.name_en)},
  ${quote(profile.arcana)}, ${nullable(profile.suit)}, ${quote(profile.rank)},
  ${textArray(profile.upright_keywords)}, ${textArray(profile.reversed_keywords)},
  ${quote(profile.upright_one_line)}, ${quote(profile.reversed_one_line)}
)`).join(",\n");

const baseValues = baseInterpretations.map((base) => `(
  ${base.card_id}, ${quote(JSON.stringify(base.upright))}::jsonb,
  ${quote(JSON.stringify(base.reversed))}::jsonb, ${textArray(base.source_files)}
)`).join(",\n");

function buildReadingValues(readings) {
  return readings.map((reading) => `(
    ${reading.card_id}, ${quote(reading.topic_id)}, ${quote(reading.orientation)}::tarot_orientation,
    ${quote(reading.headline)}, ${quote(reading.core_message)}, ${quote(reading.emotional_layer)},
    ${quote(reading.hidden_context)}, ${quote(reading.challenge)}, ${quote(reading.opportunity)},
    ${quote(reading.near_future)}, ${quote(reading.advice)}, ${quote(reading.reflection_question)}
  )`).join(",\n");
}

function buildReadingStatement(readings) {
  return `insert into tarot_topic_readings (
  card_id, topic_id, orientation, headline, core_message, emotional_layer,
  hidden_context, challenge, opportunity, near_future, advice, reflection_question
) values
${buildReadingValues(readings)}
on conflict (card_id, topic_id, orientation) do update set
  headline = excluded.headline,
  core_message = excluded.core_message,
  emotional_layer = excluded.emotional_layer,
  hidden_context = excluded.hidden_context,
  challenge = excluded.challenge,
  opportunity = excluded.opportunity,
  near_future = excluded.near_future,
  advice = excluded.advice,
  reflection_question = excluded.reflection_question;`;
}

const readingValues = buildReadingValues(topicReadings);

const sql = `begin;

insert into tarot_card_profiles (
  card_id, name_ko, name_en, arcana, suit, rank,
  upright_keywords, reversed_keywords, upright_one_line, reversed_one_line
) values
${profileValues}
on conflict (card_id) do update set
  name_ko = excluded.name_ko,
  name_en = excluded.name_en,
  arcana = excluded.arcana,
  suit = excluded.suit,
  rank = excluded.rank,
  upright_keywords = excluded.upright_keywords,
  reversed_keywords = excluded.reversed_keywords,
  upright_one_line = excluded.upright_one_line,
  reversed_one_line = excluded.reversed_one_line;

insert into tarot_base_interpretations (card_id, upright, reversed, source_files)
values
${baseValues}
on conflict (card_id) do update set
  upright = excluded.upright,
  reversed = excluded.reversed,
  source_files = excluded.source_files;

insert into tarot_topic_readings (
  card_id, topic_id, orientation, headline, core_message, emotional_layer,
  hidden_context, challenge, opportunity, near_future, advice, reflection_question
) values
${readingValues}
on conflict (card_id, topic_id, orientation) do update set
  headline = excluded.headline,
  core_message = excluded.core_message,
  emotional_layer = excluded.emotional_layer,
  hidden_context = excluded.hidden_context,
  challenge = excluded.challenge,
  opportunity = excluded.opportunity,
  near_future = excluded.near_future,
  advice = excluded.advice,
  reflection_question = excluded.reflection_question;

commit;
`;

const outputPath = path.join(importRoot, "tarot-interpretations.sql");
const partsRoot = path.join(importRoot, "seed-parts");
await mkdir(partsRoot, { recursive: true });

const profilePart = `begin;
insert into tarot_card_profiles (
  card_id, name_ko, name_en, arcana, suit, rank,
  upright_keywords, reversed_keywords, upright_one_line, reversed_one_line
) values
${profileValues}
on conflict (card_id) do update set
  name_ko = excluded.name_ko,
  name_en = excluded.name_en,
  arcana = excluded.arcana,
  suit = excluded.suit,
  rank = excluded.rank,
  upright_keywords = excluded.upright_keywords,
  reversed_keywords = excluded.reversed_keywords,
  upright_one_line = excluded.upright_one_line,
  reversed_one_line = excluded.reversed_one_line;
commit;
`;

const basePart = `begin;
insert into tarot_base_interpretations (card_id, upright, reversed, source_files)
values
${baseValues}
on conflict (card_id) do update set
  upright = excluded.upright,
  reversed = excluded.reversed,
  source_files = excluded.source_files;
commit;
`;

const partWrites = [
  writeFile(path.join(partsRoot, "01-profiles.sql"), profilePart, "utf8"),
  writeFile(path.join(partsRoot, "02-base.sql"), basePart, "utf8"),
];

const readingChunkSize = 78;
for (let offset = 0; offset < topicReadings.length; offset += readingChunkSize) {
  const chunk = topicReadings.slice(offset, offset + readingChunkSize);
  const partNumber = String(offset / readingChunkSize + 3).padStart(2, "0");
  const partSql = `begin;\n${buildReadingStatement(chunk)}\ncommit;\n`;
  partWrites.push(
    writeFile(path.join(partsRoot, `${partNumber}-readings.sql`), partSql, "utf8"),
  );
}

await Promise.all([writeFile(outputPath, sql, "utf8"), ...partWrites]);
console.log(
  `seed built: profiles=${profiles.length} base=${baseInterpretations.length} readings=${topicReadings.length} parts=${partWrites.length} bytes=${Buffer.byteLength(sql)}`,
);
