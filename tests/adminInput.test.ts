import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAdminQuery, parseMemberRole, parseRoleVersion, validMemberNumber } from "../util/adminInput.ts";

test("회원 검색과 페이지 입력은 제한된 값만 허용", () => {
  assert.deepEqual(parseAdminQuery(new URLSearchParams("search=tr-ab&offset=20")), { search: "TR-AB", offset: 20 });
  for (const query of ["offset=-1", "offset=1.2", "offset=Infinity", "search=%25", "offset=1000001"]) {
    assert.throws(() => parseAdminQuery(new URLSearchParams(query)));
  }
  assert.equal(validMemberNumber("TR-" + "A".repeat(32)), true);
  assert.equal(validMemberNumber("someone@example.com"), false);
});
test("일반과 슈퍼만 변경 가능하며 관리자 권한 필드는 허용하지 않음", () => {
  assert.equal(parseMemberRole({ role: "member" }), "member");
  assert.equal(parseMemberRole({ role: "super" }), "super");
  for (const body of [null, { role: "admin" }, { role: "super", isAdmin: true }, []]) assert.throws(() => parseMemberRole(body));
});
test("안내 확인은 정수 등급 버전을 명시해야 함", () => {
  assert.equal(parseRoleVersion({ roleVersion: 0 }), 0);
  for (const body of [{}, { roleVersion: -1 }, { roleVersion: "1" }, { roleVersion: 0.5 }]) assert.throws(() => parseRoleVersion(body));
});
