import assert from "node:assert/strict";
import test from "node:test";
import { HOME_CONTENT } from "../constants/homeContent.ts";

test("sends the approved landing call to action to tarot selection", () => {
  assert.equal(HOME_CONTENT.title, "타로타르트");
  assert.equal(HOME_CONTENT.cta, "시작하기");
  assert.equal(HOME_CONTENT.href, "/select");
  assert.match(HOME_CONTENT.description, /당신의 마음 한 조각/);
});
