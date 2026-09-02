import assert from "node:assert/strict";
import test from "node:test";

import { buildTarotReadingResult } from "../util/tarotReadingResult.ts";

const card = {
  card_id: 0,
  name_ko: "바보",
  name_en: "The Fool",
  arcana: "major" as const,
  suit: null,
  rank: "0",
  upright_keywords: ["자유", "모험", "가능성"],
  reversed_keywords: ["지연", "내적 갈등"],
  upright_one_line: "새로운 가능성을 가볍게 탐색해보세요.",
  reversed_one_line: "서두르기 전에 위험과 준비 상태를 확인하세요.",
};

const reading = {
  card_id: 0,
  topic_id: "personal-flow" as const,
  orientation: "upright" as const,
  headline: "새로운 시작 앞에서",
  core_message: "익숙한 틀을 벗어날 가능성이 열리고 있습니다.",
  emotional_layer: "기대와 불안이 함께 움직일 수 있습니다.",
  hidden_context: "완벽한 준비를 기다리는 마음이 숨어 있습니다.",
  challenge: "충동과 용기를 구분해야 합니다.",
  opportunity: "작은 첫걸음으로 가능성을 확인할 수 있습니다.",
  near_future: "새로운 선택지가 구체적으로 보일 수 있습니다.",
  advice: "되돌릴 수 있는 작은 시도부터 시작하세요.",
  reflection_question: "지금 가볍게 시험해볼 수 있는 선택은 무엇인가요?",
};

test("tarot reading route result returns the selected topic reading", () => {
  assert.deepEqual(buildTarotReadingResult(card, reading), {
    card,
    reading,
    fallback: false,
  });
});

test("tarot reading route result marks a missing reading as fallback", () => {
  assert.deepEqual(buildTarotReadingResult(card, null), {
    card,
    reading: null,
    fallback: true,
  });
});
