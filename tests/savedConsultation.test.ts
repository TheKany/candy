import test from "node:test";
import assert from "node:assert/strict";
import { parseSavedConsultation, readLimitedJson, assertSameOrigin } from "../util/validateSavedConsultation.ts";
const valid = () => ({ consultationId: "e5db3e16-ffb7-4b3f-a9c7-3e42c32c291a", revision: 1,
  readings: [{ title: "상담", question: "질문", keywords: ["관계"], sections: [{ title: "카드", text: "<script>그냥 글자</script>", cardId: 2 }] }] });
test("저장 payload는 식별자 변조와 비정상 구조를 거부한다", () => {
  assert.deepEqual(parseSavedConsultation(valid()), valid());
  const monthly = valid();
  monthly.readings[0].sections = Array.from({ length: 72 }, () => ({ title: "월별 해설", text: "한 해의 이야기", cardId: 0 }));
  assert.equal(parseSavedConsultation(monthly).readings[0].sections.length, 72);
  for (const payload of [{ ...valid(), role: "super" }, { ...valid(), user_id: "other" }, { ...valid(), revision: -1 }, { ...valid(), readings: [] }, { ...valid(), readings: [{ ...valid().readings[0], sections: [{ title: "카드", text: "해설", cardId: 90 }] }] }]) assert.throws(() => parseSavedConsultation(payload));
});
test("변경 요청은 같은 origin의 JSON만 허용하고 본문 크기를 제한한다", async () => {
  assert.throws(() => assertSameOrigin(new Request("https://tarotart.vercel.app/api/consultations", { method: "POST", headers: { origin: "https://evil.test" } })));
  await assert.rejects(readLimitedJson(new Request("https://tarotart.vercel.app", { method: "POST", body: "a".repeat(1048577), headers: { "content-type": "application/json" } })));
});
