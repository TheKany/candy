import test from "node:test";
import assert from "node:assert/strict";
import { parseMonthlyReading, parseMonthlyRequest } from "../util/monthlyReadingWriter.ts";

const page = { month: 12, cardId: 0, nickname: "새로운 발걸음", message: "익숙한 일상에서 작은 변화를 시도해보세요.",
  money: "새 지출을 늘리기 전에 이번 달의 생활비를 먼저 확인해보세요.",
  work: "처음부터 완벽하려 하기보다 작은 일을 직접 해보며 배워보세요.",
  relationships: "가벼운 안부로 대화를 시작하고 상대의 속도도 살펴보세요.",
  wellbeing: "새로운 활동을 하되 충분히 쉴 시간을 함께 마련해보세요.", luck: 65,
  luckMessage: "작은 시도가 새로운 경험으로 이어질 수 있어요." };
const period = { year: 2026, startMonth: 12, months: [12] };

test("월별 요청은 필요한 수의 서로 다른 실제 카드 번호만 받는다", () => {
  assert.deepEqual(parseMonthlyRequest({ year: 2026, startMonth: 12, cardIds: [0] }), { year: 2026, startMonth: 12, cardIds: [0] });
  for (const bad of [null, { year: 2026, startMonth: 0, cardIds: [0] }, { year: 2026, startMonth: 11, cardIds: [0,0] }, { year: 2026, startMonth: 12, cardIds: [78] }, { year: 2026, startMonth: 12, cardIds: ["1"] }]) {
    assert.equal(parseMonthlyRequest(bad), null);
  }
});

test("1~12개월 응답을 검증하고 카드/월/지수 오류를 거절한다", () => {
  assert.equal(parseMonthlyReading({ pages: [page] }, period, [0])[0].month, 12);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  assert.equal(parseMonthlyReading({ pages: months.map((month, i) => ({ ...page, month, cardId: i, luck: i === 0 ? 0 : 100 })) }, { year: 2026, startMonth: 1, months }, months.map(m => m-1)).length, 12);
  for (const change of [{ luck: 101 }, { luck: -1 }, { luck: 3.5 }, { month: 11 }, { cardId: 1 }, { money: "" }, { nickname: null }]) {
    assert.throws(() => parseMonthlyReading({ pages: [{ ...page, ...change }] }, period, [0]));
  }
  assert.throws(() => parseMonthlyReading({ pages: [page, page] }, period, [0]));
});
