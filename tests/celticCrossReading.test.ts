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
  summary: [
    "지금은 역할을 정리해야 해요.",
    "장애물이 아직 남아 있어요.",
    "마음속 망설임이 깊어 보여요.",
    "바라는 방향이 분명해요.",
    "지난 경험이 기준이 되었어요.",
    "가까운 시기에 새 제안이 들어올 수 있어요.",
    "내 선택을 믿어볼 때예요.",
    "주변의 협력이 필요해요.",
    "기대와 불안이 함께 움직여요.",
    "이 흐름은 작은 성과로 이어질 수 있어요.",
  ][index],
  detail: `저장된 상세 ${index + 1}`,
  advice: `조언 ${index + 1}`,
  reflection_question: `질문 ${index + 1}`,
}));

test("maps ten selected cards to Celtic positions and their own orientations", () => {
  const result = buildCelticCrossReading(cards, orientations, readings);

  assert.equal(result.pages.length, 10);
  assert.equal(result.pages[0].positionLabel, "현재 상황");
  assert.equal(result.pages[0].summary, "지금은 역할을 정리해야 해요.");
  assert.equal(result.pages[1].summary, "장애물이 아직 남아 있어요.");
  assert.equal(result.pages[2].summary, "마음속 망설임이 깊어 보여요.");
  assert.equal(result.pages[5].summary, "가까운 시기에 새 제안이 들어올 수 있어요.");
  assert.equal(result.pages[9].detail, "저장된 상세 10");
  assert.equal(result.pages[4].reflectionQuestion, "질문 5");
  assert.equal(result.pages[9].orientation, "reversed");
  assert.match(result.conclusion, /지금은 역할을 정리해야 해요/);
  assert.match(result.conclusion, /저장된 상세 1/);
  assert.match(result.conclusion, /저장된 상세 10/);
  assert.match(result.coreConflict, /장애물이 아직 남아 있어요/);
  assert.match(result.coreConflict, /저장된 상세 2/);
  assert.match(result.innerGap, /바라는 방향이 분명해요/);
  assert.match(result.innerGap, /저장된 상세 4/);
  assert.match(result.timeline, /가까운 시기에 새 제안이 들어올 수 있어요/);
  assert.match(result.timeline, /저장된 상세 6/);
  assert.match(result.outerInfluence, /저장된 상세 9/);
  assert.doesNotMatch(result.conclusion, /지금은 지금은/);
  assert.doesNotMatch(result.coreConflict, /에서는 지금은/);
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
