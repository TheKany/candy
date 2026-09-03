import assert from "node:assert/strict";
import test from "node:test";

import { FIVE_CARD_POSITIONS } from "../constants/fiveCardPositions.ts";
import type { TarotCardProfile, TarotPositionReading } from "../types/tarotReadingTypes.ts";
import { buildFiveCardReading } from "../util/fiveCardReading.ts";

const cards: TarotCardProfile[] = Array.from({ length: 5 }, (_, index) => ({
  card_id: index,
  name_ko: `카드 ${index + 1}`,
  name_en: `Card ${index + 1}`,
  arcana: "major",
  suit: null,
  rank: String(index),
  upright_keywords: ["키워드"],
  reversed_keywords: ["역방향"],
  upright_one_line: `기본 해석 ${index + 1}`,
  reversed_one_line: `역방향 해석 ${index + 1}`,
}));

const readings: TarotPositionReading[] = cards.map((card, index) => ({
  card_id: card.card_id,
  topic_id: "career",
  orientation: "upright",
  reading_type: "five",
  layout_id: "insight",
  position_id: FIVE_CARD_POSITIONS[index].id,
  headline: `제목 ${index + 1}`,
  summary: `요약 ${index + 1}`,
  detail: `상세 ${index + 1}`,
  advice: `조언 ${index + 1}`,
  reflection_question: `질문 ${index + 1}`,
}));

test("maps five cards to situation, cause, obstacle, advice, and outcome", () => {
  const result = buildFiveCardReading(cards, readings);

  assert.deepEqual(result.pages.map((page) => page.positionLabel), ["상황", "원인", "장애물", "조언", "결과"]);
  assert.deepEqual(result.pages.map((page) => page.summary), readings.map((reading) => reading.summary));
  assert.match(result.conclusion, /요약 1/);
  assert.match(result.conclusion, /요약 5/);
  assert.equal(result.advice, "조언 4");
});
