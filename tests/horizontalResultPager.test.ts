import assert from "node:assert/strict";
import test from "node:test";

import {
  clampResultPage,
  getNavigationButtonTarget,
} from "../util/horizontalResultPager.ts";

test("keeps result navigation inside four pages", () => {
  assert.equal(clampResultPage(-1, 4), 0);
  assert.equal(clampResultPage(4, 4), 3);
  assert.equal(clampResultPage(2, 4), 2);
});

test("moves result pages only through previous and next button actions", () => {
  assert.equal(getNavigationButtonTarget(1, "previous", 4), 0);
  assert.equal(getNavigationButtonTarget(1, "next", 4), 2);
  assert.equal(getNavigationButtonTarget(0, "previous", 4), 0);
  assert.equal(getNavigationButtonTarget(3, "next", 4), 3);
  assert.equal(getNavigationButtonTarget(0, "previous", 12), 0);
  assert.equal(getNavigationButtonTarget(0, "next", 12), 1);
  assert.equal(getNavigationButtonTarget(10, "next", 12), 11);
  assert.equal(getNavigationButtonTarget(11, "next", 12), 11);
});
