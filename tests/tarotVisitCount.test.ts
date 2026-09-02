import assert from "node:assert/strict";
import test from "node:test";

import { formatTarotVisitCount } from "../util/tarotVisitCount.ts";

test("formats the completed-reading count for the home speech bubble", () => {
  assert.equal(formatTarotVisitCount(0), "타르트 사간 사람 총 0명");
  assert.equal(formatTarotVisitCount(1234), "타르트 사간 사람 총 1,234명");
});
