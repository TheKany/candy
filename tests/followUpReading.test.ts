import test from "node:test";
import assert from "node:assert/strict";
import { parseWrittenReading } from "../util/readingWriter.ts";

const reading = () => ({
  conclusion: "질문에 대한 충분히 길고 구체적인 결론을 여기에 담아서 전달해요.",
  advice: "현실에서 실천할 수 있는 행동을 차분하게 살펴보세요. ".repeat(4),
  pages: [{ headline: "내가 지킬 수 있는 거리", summary: "상대와 나의 속도가 다를 수 있다는 점을 살펴봐요.", detail: "서두르지 않고 지금 확인할 수 있는 사실과 내 마음을 구분해서 바라보세요. ".repeat(6), reflectionQuestion: "지금 내가 할 수 있는 일은 무엇인가요?" }],
});

test("연계 질문이 빠진 AI 응답은 완성된 해설로 처리하지 않는다", () => {
  assert.throws(() => parseWrittenReading(reading(), 1));
});

test("추천 질문과 상담 요약을 함께 전달하고 중복 질문은 거부한다", () => {
  const complete = { ...reading(), followUpQuestions: ["내가 먼저 어떤 행동을 하면 좋을까요?", "이 관계에서 어떤 경계를 지키면 좋을까요?"], contextSummary: "친구로 가까워지고 싶은 관계에서 상대의 속도를 존중하며 천천히 연락하기로 살펴본 상담이에요." };
  assert.deepEqual(parseWrittenReading(complete, 1), complete);
  assert.throws(() => parseWrittenReading({ ...complete, followUpQuestions: [complete.followUpQuestions[0], complete.followUpQuestions[0]] }, 1));
});
