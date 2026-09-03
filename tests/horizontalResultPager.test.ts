import assert from "node:assert/strict";
import test from "node:test";

import {
  clampResultPage,
  getSwipeTargetPage,
} from "../util/horizontalResultPager.ts";

test("keeps result navigation inside four pages", () => {
  assert.equal(clampResultPage(-1, 4), 0);
  assert.equal(clampResultPage(4, 4), 3);
  assert.equal(clampResultPage(2, 4), 2);
});

test("moves one page only after a deliberate horizontal swipe", () => {
  assert.equal(getSwipeTargetPage(1, 120, 50, 4), 2);
  assert.equal(getSwipeTargetPage(1, 50, 120, 4), 0);
  assert.equal(getSwipeTargetPage(1, 100, 75, 4), 1);
  assert.equal(getSwipeTargetPage(3, 120, 40, 4), 3);
});
