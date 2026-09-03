import assert from "node:assert/strict";
import test from "node:test";

import { buildThreeCardReading } from "../util/threeCardReading.ts";

const cards = [
  {
    card_id: 0,
    name_ko: "바보",
    name_en: "The Fool",
    arcana: "major" as const,
    suit: null,
    rank: "0",
    upright_keywords: ["자유", "시작"],
    reversed_keywords: ["충동", "지연"],
    upright_one_line: "새로운 가능성을 가볍게 탐색해보세요.",
    reversed_one_line: "서두르기 전에 준비 상태를 확인하세요.",
  },
  {
    card_id: 1,
    name_ko: "마법사",
    name_en: "The Magician",
    arcana: "major" as const,
    suit: null,
    rank: "1",
    upright_keywords: ["실행", "집중"],
    reversed_keywords: ["분산", "과장"],
    upright_one_line: "가진 능력을 실제 행동으로 옮겨보세요.",
    reversed_one_line: "힘이 흩어지는 원인을 살펴보세요.",
  },
  {
    card_id: 2,
    name_ko: "여사제",
    name_en: "The High Priestess",
    arcana: "major" as const,
    suit: null,
    rank: "2",
    upright_keywords: ["직관", "통찰"],
    reversed_keywords: ["혼란", "침묵"],
    upright_one_line: "조용히 내면의 답을 확인해보세요.",
    reversed_one_line: "직관과 불안을 구분해야 합니다.",
  },
];

const readings = cards.map((card, index) => ({
  card_id: card.card_id,
  topic_id: "career" as const,
  orientation: "upright" as const,
  headline: `${card.name_ko}의 일 흐름`,
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

test("maps timeline cards to past, present, and future meanings in picked order", () => {
  const result = buildThreeCardReading("timeline", cards, readings);

  assert.deepEqual(result.pages.map(({ positionLabel }) => positionLabel), ["과거", "현재", "미래"]);
  assert.equal(result.pages[0].card.card_id, 0);
  assert.equal(result.pages[0].summary, "숨은 맥락 1");
  assert.equal(result.pages[1].summary, "핵심 2");
  assert.equal(result.pages[2].summary, "미래 3");
  assert.match(result.conclusion, /과거/);
  assert.match(result.conclusion, /현재/);
  assert.match(result.conclusion, /미래/);
});

test("treats NO, hold, and YES as conditions instead of a card vote", () => {
  const result = buildThreeCardReading("direction", cards, readings);

  assert.deepEqual(result.pages.map(({ positionLabel }) => positionLabel), ["NO", "보류", "YES"]);
  assert.equal(result.pages[0].summary, "과제 1");
  assert.equal(result.pages[1].summary, "숨은 맥락 2");
  assert.equal(result.pages[2].summary, "기회 3");
  assert.match(result.conclusion, /막는 신호/);
  assert.match(result.conclusion, /가능성을 여는 조건/);
});

test("falls back only for a card whose topic reading is missing", () => {
  const result = buildThreeCardReading("problem", cards, [readings[0], null, readings[2]]);

  assert.equal(result.pages[0].fallback, false);
  assert.equal(result.pages[1].fallback, true);
  assert.equal(result.pages[1].summary, cards[1].upright_one_line);
  assert.equal(result.pages[2].fallback, false);
});
