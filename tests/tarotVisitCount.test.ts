import assert from "node:assert/strict";
import test from "node:test";

import { formatTarotVisitCount } from "../util/tarotVisitCount.ts";

test("formats the completed-reading count for the home speech bubble", () => {
  assert.equal(formatTarotVisitCount(0), "지금까지 구워낸 타르트 0개");
  assert.equal(formatTarotVisitCount(1234), "지금까지 구워낸 타르트 1,234개");
});
