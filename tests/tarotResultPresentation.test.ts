import assert from "node:assert/strict";
import test from "node:test";

import { buildTarotResultPresentation } from "../util/tarotResultPresentation.ts";

const reading = {
  card_id: 35,
  topic_id: "career" as const,
  orientation: "upright" as const,
  headline: "일·커리어 · 완드 킹이 보여주는 비전",
  conclusion: "지금은 주도권을 잡고 업무의 방향을 분명히 할 때예요.",
  core_message: "비전과 통솔력을 실제 업무에 연결할 시점입니다.",
  emotional_layer: "성과에 대한 압박과 성장 욕구가 함께 움직입니다.",
  hidden_context: "책임질 범위를 넓히려는 마음이 배경에 있습니다.",
  challenge: "확신이 독단으로 보이지 않도록 조율해야 합니다.",
  opportunity: "방향을 제시하고 사람을 모을 기회가 열립니다.",
  near_future: "작은 성과가 리더십을 증명하는 근거가 됩니다.",
  advice: "통제할 수 있는 업무 하나를 정해 완성하세요.",
  reflection_question: "지금 책임지고 완성할 한 가지는 무엇인가요?",
};

test("puts a short conclusion first, details in the middle, and advice last", () => {
  assert.deepEqual(buildTarotResultPresentation(reading), {
    conclusion: reading.conclusion,
    headline: reading.headline,
    details: [
      ["지금의 전체 흐름", reading.core_message],
      ["감정의 층위", reading.emotional_layer],
      ["숨은 맥락", reading.hidden_context],
      ["마주할 과제", reading.challenge],
      ["열려 있는 기회", reading.opportunity],
      ["가까운 흐름", reading.near_future],
    ],
    advice: reading.advice,
    reflectionQuestion: reading.reflection_question,
  });
});
