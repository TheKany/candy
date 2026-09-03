import assert from "node:assert/strict";
import test from "node:test";
import { getReadingFlowRedirect } from "../util/tarotFlow.ts";

test("restores the earliest missing reading step", () => {
  assert.equal(getReadingFlowRedirect(null, null, null), "/select");
  assert.equal(getReadingFlowRedirect("one", null, null), "/topic");
  assert.equal(getReadingFlowRedirect("one", "career", null), null);
  assert.equal(getReadingFlowRedirect("three", null, null), "/spread");
  assert.equal(getReadingFlowRedirect("three", null, "timeline"), "/topic");
  assert.equal(getReadingFlowRedirect("three", "career", "timeline"), null);
});
