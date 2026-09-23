import test from "node:test";
import assert from "node:assert/strict";
import { getMonthlyPeriod } from "../util/monthlyReading.ts";
import { getRequiredCardCount, getNextPositionLabel, shouldOpenResultAfterReveal } from "../util/cardSelectionFlow.ts";
import { getReadingFlowRedirect } from "../util/tarotFlow.ts";

test("한국 월 경계와 1월·9월·12월의 남은 월을 계산한다", () => {
  assert.deepEqual(getMonthlyPeriod(new Date("2026-08-31T15:00:00Z")), { year: 2026, startMonth: 9, months: [9,10,11,12] });
  assert.equal(getMonthlyPeriod(new Date("2026-12-31T15:00:00Z")).months.length, 12);
  assert.deepEqual(getMonthlyPeriod(new Date("2026-12-01T00:00:00Z")).months, [12]);
});

test("다음 해는 한국 날짜를 기준으로 다음 연도 전체 12개월이다", () => {
  assert.deepEqual(getMonthlyPeriod(new Date("2026-09-24T00:00:00Z"), "next"), { year: 2027, startMonth: 1, months: [1,2,3,4,5,6,7,8,9,10,11,12] });
  assert.equal(getMonthlyPeriod(new Date("2026-12-31T15:00:00Z"), "next").year, 2028);
});

test("월별은 질문 없이 진행하고 마지막 카드 공개 후에만 완료한다", () => {
  assert.equal(getReadingFlowRedirect("monthly", ""), null);
  assert.equal(getRequiredCardCount("monthly", 4), 4);
  assert.equal(getNextPositionLabel("monthly", null, 1, [9,10,11,12]), "10월");
  assert.equal(shouldOpenResultAfterReveal("monthly", 3, true, 4), false);
  assert.equal(shouldOpenResultAfterReveal("monthly", 4, false, 4), false);
  assert.equal(shouldOpenResultAfterReveal("monthly", 4, true, 4), true);
  assert.equal(shouldOpenResultAfterReveal("monthly", 0, true, 0), false);
});
