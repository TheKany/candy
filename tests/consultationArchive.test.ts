import test from "node:test";
import assert from "node:assert/strict";
import { useReadingSessionStore } from "../store/useReadingSessionStore.ts";
import { readingExportSections } from "../util/readingExportLayout.ts";

test("묶음 저장은 상담 순서를 유지하며 질문을 끄면 원문 대신 키워드를 담는다", () => {
  const data = { title: "상담", sections: [], readings: [
    { title: "처음 질문", question: "비공개 질문 A", keywords: ["커리어", "이직"], sections: [{ title: "카드", cardId: 1, text: "해설 A" }] },
    { title: "연계 질문 1", question: "비공개 질문 B", keywords: ["준비 시점"], sections: [{ title: "카드", cardId: 2, text: "해설 B" }] },
  ] };
  assert.deepEqual(readingExportSections(data, false).map(s => s.text), ["커리어 · 이직", "해설 A", "준비 시점", "해설 B"]);
  assert.deepEqual(readingExportSections(data, true).map(s => s.text), ["비공개 질문 A", "해설 A", "비공개 질문 B", "해설 B"]);
});

test("상담 기록은 중복 추가하지 않고 새 상담 이후에는 다시 저장이 필요하다", () => {
  const store = useReadingSessionStore;
  store.getState().start([1, 2, 3]);
  const first = { id: "first", data: { title: "처음", question: "질문", sections: [] } };
  store.getState().remember(first);
  store.getState().remember(first);
  assert.equal(store.getState().history.length, 1);
  store.getState().markDownloaded(1);
  assert.equal(store.getState().downloadedCount, 1);
  store.getState().continueWith({ originalQuestion: "질문", summary: "요약" });
  store.getState().remember({ ...first, id: "next" });
  assert.equal(store.getState().history.length, 2);
  assert.equal(store.getState().downloadedCount, 1);
  store.getState().reset();
  assert.equal(store.getState().history.length, 0);
});
