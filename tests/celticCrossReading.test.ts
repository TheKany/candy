import assert from "node:assert/strict";
import test from "node:test";

import type {
  TarotCardProfile,
  TarotOrientation,
  TarotTopicReading,
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

const readings: TarotTopicReading[] = cards.map((card, index) => ({
  card_id: card.card_id,
  topic_id: "career",
  orientation: orientations[index],
  headline: `제목 ${index + 1}`,
  conclusion: `결론 ${index + 1}`,
  core_message: `핵심 ${index + 1}`,
  emotional_layer: `감정 ${index + 1}`,
  hidden_context: `숨은 맥락 ${index + 1}`,
  challenge: `과제 ${index + 1}`,
  opportunity: `기회 ${index + 1}`,
  near_future: `미래 ${index + 1}`,
  advice: `조언 ${index + 1}`,
  reflection_question: `질문 ${index + 1}`,
}));

test("maps ten selected cards to Celtic positions and their own orientations", () => {
  const result = buildCelticCrossReading(cards, orientations, readings);

  assert.equal(result.pages.length, 10);
  assert.equal(result.pages[0].positionLabel, "현재 상황");
  assert.equal(result.pages[0].summary, "핵심 1");
  assert.equal(result.pages[1].summary, "과제 2");
  assert.equal(result.pages[2].summary, "숨은 맥락 3");
  assert.equal(result.pages[5].summary, "미래 6");
  assert.equal(result.pages[9].orientation, "reversed");
  assert.match(result.coreConflict, /현재 상황/);
  assert.match(result.innerGap, /내면의 원인/);
  assert.match(result.timeline, /다가오는 흐름/);
});

test("falls back only for a missing position reading", () => {
  const withMissingReading: Array<TarotTopicReading | null> = [...readings];
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
