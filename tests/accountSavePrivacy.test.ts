import { test } from "node:test";
import assert from "node:assert/strict";
import { prepareAccountReadings } from "../util/prepareAccountReadings.ts";

const readings = [
  { title: "처음 상담", question: "개인적인 질문", keywords: ["커리어"], sections: [{ title: "카드", text: "해설", cardId: 0 }] },
  { title: "연계 상담", question: "추가 질문", sections: [{ title: "카드", text: "추가 해설", cardId: 1 }] },
];
test("키워드 저장은 모든 연계 질문 원문을 제거하고 카드와 해설을 유지한다", () => {
  const result = prepareAccountReadings(readings, "keywords");
  assert.ok(result.every(reading => !("question" in reading)));
  assert.deepEqual(result[0].keywords, ["커리어"]);
  assert.deepEqual(result[1].keywords, ["타로 상담"]);
  assert.deepEqual(result[1].sections, readings[1].sections);
  assert.equal(readings[0].question, "개인적인 질문");
});
test("원문 저장은 질문을 유지한다", () => {
  assert.deepEqual(prepareAccountReadings(readings, "original"), readings);
});
