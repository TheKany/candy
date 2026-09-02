import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const importRoot = path.join(projectRoot, ".tarot-import");

const topics = [
  "their-feelings",
  "new-love",
  "relationship-flow",
  "career",
  "money",
  "relationships",
  "decision",
  "personal-flow",
];
const orientations = ["upright", "reversed"];
const baseFields = [
  "overview",
  "current_situation",
  "emotion",
  "cause",
  "future",
  "advice",
  "love",
  "career",
  "relationships",
  "other",
];
const readingFields = [
  "headline",
  "core_message",
  "emotional_layer",
  "hidden_context",
  "challenge",
  "opportunity",
  "near_future",
  "advice",
  "reflection_question",
];

const failures = [];
const fail = (message) => failures.push(message);
const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

async function loadJson(filename) {
  const filePath = path.join(importRoot, filename);
  return JSON.parse(await readFile(filePath, "utf8"));
}

function validateProfiles(profiles) {
  if (!Array.isArray(profiles) || profiles.length !== 78) {
    fail(`profiles count must be 78, received ${profiles?.length ?? "invalid"}`);
    return;
  }

  const ids = new Set();
  for (const profile of profiles) {
    ids.add(profile.card_id);
    for (const field of [
      "name_ko",
      "name_en",
      "arcana",
      "rank",
      "upright_one_line",
      "reversed_one_line",
    ]) {
      if (!isNonEmptyString(profile[field])) {
        fail(`profile ${profile.card_id} has an empty ${field}`);
      }
    }
    for (const field of ["upright_keywords", "reversed_keywords"]) {
      if (!Array.isArray(profile[field]) || profile[field].length === 0 || profile[field].some((item) => !isNonEmptyString(item))) {
        fail(`profile ${profile.card_id} has invalid ${field}`);
      }
    }
  }

  for (let cardId = 0; cardId < 78; cardId += 1) {
    if (!ids.has(cardId)) fail(`profile ${cardId} is missing`);
  }
}

function validateBaseInterpretations(baseInterpretations) {
  if (!Array.isArray(baseInterpretations) || baseInterpretations.length !== 78) {
    fail(`base count must be 78, received ${baseInterpretations?.length ?? "invalid"}`);
    return;
  }

  const ids = new Set();
  for (const base of baseInterpretations) {
    ids.add(base.card_id);
    for (const orientation of orientations) {
      for (const field of baseFields) {
        if (!isNonEmptyString(base[orientation]?.[field])) {
          fail(`base ${base.card_id} ${orientation}.${field} is empty`);
        }
      }
    }
    if (!Array.isArray(base.source_files) || base.source_files.length === 0) {
      fail(`base ${base.card_id} has no source_files`);
    } else {
      for (const sourceFile of base.source_files) {
        if (!isNonEmptyString(sourceFile) || !existsSync(path.join(projectRoot, sourceFile))) {
          fail(`base ${base.card_id} source file does not exist: ${sourceFile}`);
        }
      }
    }
  }

  for (let cardId = 0; cardId < 78; cardId += 1) {
    if (!ids.has(cardId)) fail(`base ${cardId} is missing`);
  }
}

function validateTopicReadings(readings) {
  if (!Array.isArray(readings) || readings.length !== 1248) {
    fail(`readings count must be 1248, received ${readings?.length ?? "invalid"}`);
    return;
  }

  const keys = new Set();
  for (const reading of readings) {
    const key = `${reading.card_id}:${reading.topic_id}:${reading.orientation}`;
    if (keys.has(key)) fail(`duplicate reading ${key}`);
    keys.add(key);
    for (const field of readingFields) {
      if (!isNonEmptyString(reading[field])) fail(`reading ${key} has an empty ${field}`);
    }
  }

  for (let cardId = 0; cardId < 78; cardId += 1) {
    for (const topic of topics) {
      for (const orientation of orientations) {
        const key = `${cardId}:${topic}:${orientation}`;
        if (!keys.has(key)) fail(`reading ${key} is missing`);
      }
    }
  }
}

try {
  const [profiles, baseInterpretations, readings] = await Promise.all([
    loadJson("card-profiles.json"),
    loadJson("base-interpretations.json"),
    loadJson("topic-readings.json"),
  ]);

  validateProfiles(profiles);
  validateBaseInterpretations(baseInterpretations);
  validateTopicReadings(readings);

  if (failures.length > 0) {
    throw new Error(failures.join("\n"));
  }

  console.log(
    `tarot data valid: profiles=${profiles.length} base=${baseInterpretations.length} readings=${readings.length}`,
  );
} catch (error) {
  console.error(`tarot data validation failed:\n${error.message}`);
  process.exitCode = 1;
}
