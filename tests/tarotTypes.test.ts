import assert from "node:assert/strict";
import test from "node:test";
import {
  TAROT_TYPES,
  getTarotSelectionAction,
} from "../constants/tarotTypes.ts";

test("exposes every product reading exactly once in display order", () => {
  assert.deepEqual(
    TAROT_TYPES.map(({ id, title, subtitle, available }) => ({ id, title, subtitle, available })),
    [
      { id: "one", title: "원 오라클", subtitle: "한 장의 메시지", available: true },
      { id: "three", title: "쓰리카드", subtitle: "과거 · 현재 · 미래", available: true },
      { id: "five", title: "파이브카드", subtitle: "상황 · 원인 · 장애물 · 조언 · 결과", available: true },
    ],
  );
});

test("routes available readings to their first step and blocks unfinished readings", () => {
  assert.deepEqual(getTarotSelectionAction("one"), { kind: "navigate", href: "/topic", type: "one" });
  assert.deepEqual(getTarotSelectionAction("three"), { kind: "navigate", href: "/topic", type: "three" });
  assert.deepEqual(getTarotSelectionAction("five"), { kind: "navigate", href: "/topic", type: "five" });
});
