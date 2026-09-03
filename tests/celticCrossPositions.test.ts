import assert from "node:assert/strict";
import test from "node:test";

import {
  CELTIC_CROSS_POSITIONS,
  getCelticCrossPosition,
  getRandomOrientation,
} from "../constants/celticCrossPositions.ts";

test("defines the ten Celtic Cross positions in draw order", () => {
  assert.deepEqual(
    CELTIC_CROSS_POSITIONS.map((position) => position.label),
    [
      "현재 상황",
      "장애물",
      "내면의 원인",
      "의식적인 바람",
      "지나간 영향",
      "다가오는 흐름",
      "나의 태도",
      "주변 환경",
      "희망과 두려움",
      "최종 흐름",
    ],
  );
  assert.equal(getCelticCrossPosition(9)?.id, "outcome");
  assert.equal(getCelticCrossPosition(10), null);
});

test("assigns one of the two supported orientations from a random draw", () => {
  assert.equal(getRandomOrientation(() => 0.49), "upright");
  assert.equal(getRandomOrientation(() => 0.5), "reversed");
});
