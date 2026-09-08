import test from "node:test";
import assert from "node:assert/strict";
import { parseWrittenReading } from "../util/readingWriter.ts";

test("rejects truncated prose and missing or extra card pages", () => {
  const reading = { conclusion: "질문에 직접 답하는 충분한 길이의 결론을 먼저 전달하는 문장입니다.",
    advice: "지금 실천할 일과 잠시 멈출 일을 구체적으로 설명해요. 반응이 달라지지 않을 때는 일방적으로 애쓰기보다 현재 상황을 다시 확인해보세요.",
    pages: [{ headline: "카드의 의미", summary: "카드의 의미를 질문 속 상황과 연결해서 설명하는 문장입니다.",
      detail: "이 카드의 의미를 통해 현재 질문에 담긴 상황을 구체적으로 설명하고 있습니다. ".repeat(5), reflectionQuestion: "지금 확인할 수 있는 것은 무엇인가요?" }],
  };
  assert.equal(parseWrittenReading(reading, 1).pages.length, 1);
  assert.throws(() => parseWrittenReading(reading, 3));
  assert.throws(() => parseWrittenReading({ ...reading, pages: [{ ...reading.pages[0], detail: "흐름을 살펴보세요." }] }, 1));
});
