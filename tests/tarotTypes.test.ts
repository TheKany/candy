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
      { id: "one", title: "원 오라클", subtitle: "힌트 찾기", available: true },
      { id: "three", title: "쓰리카드", subtitle: "직관적인 답", available: true },
      { id: "celtic", title: "켈틱 크로스", subtitle: "마음 들여다보기", available: true },
      { id: "horoscope", title: "호로스코프", subtitle: "내 전체 흐름", available: false },
    ],
  );
});

test("routes available readings to their first step and blocks unfinished readings", () => {
  assert.deepEqual(getTarotSelectionAction("one"), { kind: "navigate", href: "/topic", type: "one" });
  assert.deepEqual(getTarotSelectionAction("three"), { kind: "navigate", href: "/spread", type: "three" });
  assert.deepEqual(getTarotSelectionAction("celtic"), { kind: "navigate", href: "/topic", type: "celtic" });
  assert.deepEqual(getTarotSelectionAction("horoscope"), { kind: "notice", message: "준비 중이에요" });
});
