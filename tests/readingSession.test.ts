import test from "node:test";
import assert from "node:assert/strict";
import { useReadingSessionStore } from "../store/useReadingSessionStore.ts";

test("연계 질문은 덱 순서와 사용한 위치를 유지하고 중복 카드를 막는다", () => {
  const store = useReadingSessionStore;
  store.getState().start([12, 5, 41, 0]);
  assert.equal(store.getState().pick(2), true);
  assert.equal(store.getState().continueWith({ originalQuestion: "친구로 가까워질 수 있을까요?", summary: "상대의 속도를 존중하며 살펴본 상담" }), true);
  assert.deepEqual(store.getState().deck, [12, 5, 41, 0]);
  assert.deepEqual(store.getState().usedPositions, [2]);
  assert.equal(store.getState().pick(2), false);
  assert.equal(store.getState().pick(5), false);
  assert.equal(store.getState().pick(1), true);
  assert.deepEqual(store.getState().usedPositions, [2, 1]);
  store.getState().pick(3); store.getState().pick(4);
  assert.equal(store.getState().continueWith({ originalQuestion: "질문", summary: "요약" }), false);
  store.getState().start([0, 41, 5, 12]);
  assert.deepEqual(store.getState().usedPositions, []);
  assert.equal(store.getState().previousConsultation, null);
  store.getState().reset();
});

test("계정 저장 완료 이후 추가 질문은 새 저장이 필요하고 초기화 시 계정 저장 상태도 지운다", () => {
  const store = useReadingSessionStore;
  store.getState().start([0, 1]);
  const firstId = store.getState().consultationId;
  store.getState().remember({ id: "a", data: { title: "질문", sections: [] } });
  store.getState().markAccountSaved(1);
  assert.equal(store.getState().accountSavedRevision, 1);
  store.getState().remember({ id: "b", data: { title: "연계", sections: [] } });
  assert.equal(store.getState().accountSavedRevision, 1);
  assert.equal(store.getState().history.length, 2);
  store.getState().reset();
  assert.equal(store.getState().accountSavedRevision, 0);
  assert.equal(store.getState().history.length, 0);
  store.getState().start([1, 0]);
  assert.notEqual(store.getState().consultationId, firstId);
  store.getState().reset();
});
