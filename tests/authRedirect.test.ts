import test from "node:test";
import assert from "node:assert/strict";
import { safeAuthReturnPath } from "../lib/auth/redirect.ts";
test("로그인 복귀는 허용한 내부 경로만 사용한다", () => {
  for (const path of [null, "//evil.test", "https://evil.test", "/\\evil.test", "/%2f%2fevil.test", "/auth/callback?code=secret"]) assert.equal(safeAuthReturnPath(path), "/");
  assert.equal(safeAuthReturnPath("/account"), "/account");
});
