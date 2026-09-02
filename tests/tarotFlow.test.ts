import assert from "node:assert/strict";
import test from "node:test";
import { getReadingFlowRedirect } from "../util/tarotFlow.ts";

test("restores the earliest missing reading step", () => {
  assert.equal(getReadingFlowRedirect(null, null), "/select");
  assert.equal(getReadingFlowRedirect("one", null), "/topic");
  assert.equal(getReadingFlowRedirect("one", "career"), null);
});
