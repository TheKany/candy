import assert from "node:assert/strict";
import test from "node:test";

import {
  THREE_CARD_SPREADS,
  getThreeCardSpread,
} from "../constants/threeCardSpreads.ts";

test("provides five selectable spreads with three ordered positions", () => {
  assert.deepEqual(
    THREE_CARD_SPREADS.map(({ id, positions }) => ({
      id,
      labels: positions.map(({ label }) => label),
    })),
    [
      { id: "timeline", labels: ["과거", "현재", "미래"] },
      { id: "problem", labels: ["상황", "장애물", "조언"] },
      { id: "relationship", labels: ["나", "상대", "관계"] },
      { id: "choice", labels: ["선택 A", "선택 B", "결정의 열쇠"] },
      { id: "direction", labels: ["NO", "보류", "YES"] },
    ],
  );
});

test("rejects an unknown persisted spread", () => {
  assert.equal(getThreeCardSpread("unknown"), null);
  assert.equal(getThreeCardSpread("timeline")?.title, "시간의 흐름");
});
