import assert from "node:assert/strict";
import test from "node:test";

import type { TarotPositionReading } from "../types/tarotReadingTypes.ts";
import { buildTarotResultPresentation } from "../util/tarotResultPresentation.ts";

const reading: TarotPositionReading = {
  card_id: 35,
  topic_id: "career" as const,
  orientation: "upright" as const,
  reading_type: "one",
  layout_id: "single",
  position_id: "message",
  headline: "일·커리어 · 완드 킹이 보여주는 비전",
  summary: "지금은 주도권을 잡고 업무의 방향을 분명히 할 때예요.",
  detail: "비전과 통솔력을 실제 업무에 연결하며, 동료와 역할을 조율해보세요.",
  advice: "통제할 수 있는 업무 하나를 정해 완성하세요.",
  reflection_question: "지금 책임지고 완성할 한 가지는 무엇인가요?",
};

test("puts a short conclusion first, details in the middle, and advice last", () => {
  assert.deepEqual(buildTarotResultPresentation(reading), {
    conclusion: reading.summary,
    headline: reading.headline,
    details: [
      ["카드가 들려주는 이야기", reading.detail],
    ],
    advice: reading.advice,
    reflectionQuestion: reading.reflection_question,
  });
});
