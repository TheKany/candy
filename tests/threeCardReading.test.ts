import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import type { TarotPositionReading } from "../types/tarotReadingTypes.ts";
import { buildThreeCardReading } from "../util/threeCardReading.ts";

const threeCardRoute = readFileSync(
  new URL("../app/api/threeCardReading/route.ts", import.meta.url),
  "utf8",
);

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

const readings: TarotPositionReading[] = cards.map((card, index) => ({
  card_id: card.card_id,
  topic_id: "career" as const,
  orientation: "upright" as const,
  reading_type: "three",
  layout_id: "timeline",
  position_id: ["past", "present", "future"][index],
  headline: `${card.name_ko}이 놓인 자리`,
  summary: [
    "지난 협업의 균열이 아직 결정에 영향을 남겼어요.",
    "지금은 역할을 정리하고 우선순위를 확인하는 때예요.",
    "이 흐름을 이어가면 다음 제안에서 선택지가 넓어질 수 있어요.",
  ][index],
  detail: `상세 해석 ${index + 1}`,
  advice: `조언 ${index + 1}`,
  reflection_question: `질문 ${index + 1}`,
}));

test("preserves the stored past, present, and future prose in picked order", () => {
  const result = buildThreeCardReading("timeline", cards, readings);

  assert.deepEqual(result.pages.map(({ positionLabel }) => positionLabel), ["과거", "현재", "미래"]);
  assert.equal(result.pages[0].card.card_id, 0);
  assert.equal(result.pages[0].headline, "바보이 놓인 자리");
  assert.equal(result.pages[0].summary, readings[0].summary);
  assert.equal(result.pages[1].summary, readings[1].summary);
  assert.equal(result.pages[2].summary, readings[2].summary);
  assert.equal(result.pages[2].detail, readings[2].detail);
  assert.equal(result.pages[1].reflectionQuestion, readings[1].reflection_question);
  assert.ok(result.conclusion.indexOf(readings[0].summary) < result.conclusion.indexOf(readings[1].summary));
  assert.ok(result.conclusion.indexOf(readings[1].summary) < result.conclusion.indexOf(readings[2].summary));
  assert.doesNotMatch(result.conclusion, /^\s*[“"]/);
  assert.doesNotMatch(result.conclusion, /지금은 지금은|이 흐름을 이어가면 이 흐름을 이어가면/);
});

test("treats NO, hold, and YES as conditions instead of a card vote", () => {
  const directionReadings = readings.map((reading, index) => ({
    ...reading,
    layout_id: "direction",
    position_id: ["no", "hold", "yes"][index],
    summary: [
      "지금은 계약 조건이 불분명한 채로 서명하면 안 돼요.",
      "비용과 일정이 문서로 확인되는지 더 살펴봐야 해요.",
      "담당자와 책임 범위가 분명해지면 진행해도 좋아요.",
    ][index],
  }));
  const result = buildThreeCardReading("direction", cards, directionReadings);

  assert.deepEqual(result.pages.map(({ positionLabel }) => positionLabel), ["NO", "보류", "YES"]);
  assert.equal(result.pages[0].summary, directionReadings[0].summary);
  assert.equal(result.pages[1].summary, directionReadings[1].summary);
  assert.equal(result.pages[2].summary, directionReadings[2].summary);
  assert.match(result.conclusion, /^현재 답은 조건부 YES\/보류\/NO에 가깝습니다\./);
  assert.match(result.conclusion, /서명하면 안 돼요/);
  assert.match(result.conclusion, /문서로 확인되는지/);
  assert.match(result.conclusion, /진행해도 좋아요/);
  assert.doesNotMatch(result.conclusion, /카드.*투표|표결/);
});

test("falls back only for a card whose topic reading is missing", () => {
  const result = buildThreeCardReading("problem", cards, [readings[0], null, readings[2]]);

  assert.equal(result.pages[0].fallback, false);
  assert.equal(result.pages[1].fallback, true);
  assert.equal(result.pages[1].summary, cards[1].upright_one_line);
  assert.equal(result.pages[2].fallback, false);
});

test("queries each selected three-card layout position from stored readings", () => {
  assert.match(threeCardRoute, /\.from\("tarot_position_readings"\)/);
  assert.match(threeCardRoute, /\.eq\("reading_type", "three"\)/);
  assert.match(threeCardRoute, /\.eq\("layout_id", spread\.id\)/);
  assert.match(threeCardRoute, /\.in\("position_id", spread\.positions\.map\(\(position\) => position\.id\)\)/);
});
