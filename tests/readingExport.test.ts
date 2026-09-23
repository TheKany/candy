import test from "node:test";
import assert from "node:assert/strict";
import { wrapExportText, exportSections } from "../util/readingExportLayout.ts";

test("긴 한글과 줄바꿈을 누락 없이 나누고 질문은 선택했을 때만 넣는다", () => {
  assert.deepEqual(wrapExportText("가나다라마바사\n다음", 3, s => s.length), ["가나다", "라마바", "사", "다음"]);
  const sections = [{ title: "결론", text: "내용" }];
  assert.deepEqual(exportSections(sections, "비공개 질문", false), sections);
  assert.deepEqual(exportSections(sections, "비공개 질문", true)[0], {title:"내 질문",text:"비공개 질문"});
  assert.equal(exportSections(sections, undefined, true).length, 1);
});
