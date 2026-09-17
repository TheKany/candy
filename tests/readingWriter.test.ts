import test from "node:test";
import assert from "node:assert/strict";
import { parseWrittenReading } from "../util/readingWriter.ts";

test("multi-card overview requires two separate explanatory paragraphs", () => {
  const page = { headline: "지금 살펴볼 부분", summary: "지금 질문에 담긴 상황을 카드와 연결하여 읽어보세요.", detail: "질문에 나온 상황과 카드의 의미를 연결하여 차분히 살펴보는 설명이에요. ".repeat(5), reflectionQuestion: "지금 확인할 수 있는 것은 무엇인가요?" };
  const reading = { conclusion: "가능성은 열려 있어요. 지금은 성과가 어떻게 전달되는지 확인할 때예요.", advice: "실제로 확인할 수 있는 기준부터 차분히 살펴보세요. 새로운 일을 더 맡기 전에 현재의 성과와 기대하는 역할을 정리하여 담당자와 이야기해보세요.", pages: [page, page, page] };
  assert.throws(() => parseWrittenReading(reading, 3));
  const overview = ["지금까지 쌓아온 노력이 어떤 결과로 이어졌는지 살펴보는 것이 이번 질문의 출발점이에요.", "다만 카드만으로 승진을 확정할 수는 없어요. 실제 평가 기준과 기회도 함께 확인해야 해요."];
  assert.deepEqual(parseWrittenReading({ ...reading, overview }, 3).overview, overview);
  assert.throws(() => parseWrittenReading({ ...reading, overview: [overview[0]] }, 3));
});

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
