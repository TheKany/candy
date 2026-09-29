import { test } from "node:test";
import assert from "node:assert/strict";
import { safeActivityTopic, isRepresentativeCard, rewardDisplay } from "../util/mypageRules.ts";
test("대표 카드 번호는 78장 범위 또는 선택 해제만 허용", () => {
  for (const id of [null, 0, 77]) assert.equal(isRepresentativeCard(id), true);
  for (const id of [-1, 78, 0.5, "17", undefined]) assert.equal(isRepresentativeCard(id), false);
});
test("미저장 이용내역 주제는 자유입력 개인정보를 복사하지 않는다", () => {
  assert.equal(safeActivityTopic(["홍길동의 승진", "회사"]), "일·커리어");
  assert.equal(safeActivityTopic(["010-1234-5678", "개인적인 이야기"]), "타로 상담");
});
test("3회 시청이면 완료, 기본 시트는 출처와 무관하게 사용 가능", () => {
  assert.deepEqual(rewardDisplay(3, 4, 2), { stamps: 3, completed: true, premium: 4, basic: 2, basicUsable: true });
  assert.equal(rewardDisplay(2, 0, 2).completed, false);
  assert.equal(rewardDisplay(0, 0, 0).basicUsable, false);
});
