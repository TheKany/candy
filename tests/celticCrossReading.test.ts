import assert from "node:assert/strict";
import test from "node:test";

import type {
  TarotCardProfile,
  TarotOrientation,
  TarotPositionReading,
} from "../types/tarotReadingTypes.ts";
import {
  buildCelticCrossReading,
  isValidCelticCrossSelection,
} from "../util/celticCrossReading.ts";

const orientations: TarotOrientation[] = [
  "upright", "reversed", "upright", "reversed", "upright",
  "reversed", "upright", "reversed", "upright", "reversed",
];

const cards: TarotCardProfile[] = Array.from({ length: 10 }, (_, index) => ({
  card_id: index,
  name_ko: `카드 ${index + 1}`,
  name_en: `Card ${index + 1}`,
  arcana: "major",
  suit: null,
  rank: String(index),
  upright_keywords: [`정방향 키워드 ${index + 1}`],
  reversed_keywords: [`역방향 키워드 ${index + 1}`],
  upright_one_line: `정방향 기본 해석 ${index + 1}`,
  reversed_one_line: `역방향 기본 해석 ${index + 1}`,
}));

const readings: TarotPositionReading[] = cards.map((card, index) => ({
  card_id: card.card_id,
  topic_id: "career",
  orientation: orientations[index],
  reading_type: "celtic",
  layout_id: "celtic-cross",
  position_id: ["present", "obstacle", "root", "goal", "past", "near-future", "self", "environment", "hopes-fears", "outcome"][index],
  headline: `제목 ${index + 1}`,
  summary: `저장된 요약 ${index + 1}`,
  detail: `저장된 상세 ${index + 1}`,
  advice: `조언 ${index + 1}`,
  reflection_question: `질문 ${index + 1}`,
}));

test("maps ten selected cards to Celtic positions and their own orientations", () => {
  const result = buildCelticCrossReading(cards, orientations, readings);

  assert.equal(result.pages.length, 10);
  assert.equal(result.pages[0].positionLabel, "현재 상황");
  assert.equal(result.pages[0].summary, "저장된 요약 1");
  assert.equal(result.pages[1].summary, "저장된 요약 2");
  assert.equal(result.pages[2].summary, "저장된 요약 3");
  assert.equal(result.pages[5].summary, "저장된 요약 6");
  assert.equal(result.pages[9].detail, "저장된 상세 10");
  assert.equal(result.pages[4].reflectionQuestion, "질문 5");
  assert.equal(result.pages[9].orientation, "reversed");
  assert.match(result.conclusion, /저장된 요약 1/);
  assert.match(result.coreConflict, /저장된 요약 2/);
  assert.match(result.innerGap, /저장된 요약 4/);
  assert.match(result.timeline, /저장된 요약 6/);
  assert.doesNotMatch(result.conclusion, /“|”/);
});

test("falls back only for a missing position reading", () => {
  const withMissingReading: Array<TarotPositionReading | null> = [...readings];
  withMissingReading[9] = null;

  const result = buildCelticCrossReading(cards, orientations, withMissingReading);

  assert.equal(result.pages[8].fallback, false);
  assert.equal(result.pages[9].fallback, true);
  assert.equal(result.pages[9].summary, "역방향 기본 해석 10");
});

test("rejects incomplete, duplicate, or malformed Celtic selections", () => {
  assert.equal(isValidCelticCrossSelection(cards.map((card) => card.card_id), orientations), true);
  assert.equal(isValidCelticCrossSelection([0, 1], ["upright", "reversed"]), false);
  assert.equal(isValidCelticCrossSelection([0, 1, 2, 3, 4, 5, 6, 7, 8, 8], orientations), false);
  assert.equal(isValidCelticCrossSelection(cards.map((card) => card.card_id), [...orientations.slice(0, 9), "sideways"]), false);
});
