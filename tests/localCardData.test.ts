import assert from "node:assert/strict";
import test from "node:test";
import { getCardCount } from "../util/getCardData.ts";

test("returns the complete local tarot deck size without remote card data", async () => {
  assert.equal(await getCardCount(), 78);
});
