import assert from "node:assert/strict";
import test from "node:test";
import { analyzeQuestion } from "../util/analyzeQuestion.ts";

test("friendship and negated attraction are not classified as romance", () => {
  const result = analyzeQuestion("남자야 친해지소 싶응 여자분이 있는데 연락이 잘 되다가뜸해 이분을 좋아하는게 아니야 진짜 친구 로 친해지고 싶은 마음이야. 난 결혼함");
  assert.equal(result.topic, "relationships");
  assert.equal(result.intent, "contact");
  assert.equal(result.relationshipGoal, "friendship");
});

test("work questions distinguish flow, decisions, and possibilities", () => {
  assert.equal(analyzeQuestion("앞으로 내 회사생활은 어떻게 될까?").topic, "career");
  assert.equal(analyzeQuestion("앞으로 내 회사생활은 어떻게 될까?").intent, "flow");
  assert.equal(analyzeQuestion("지금 회사 그만둬도 될까?").intent, "choice");
  assert.equal(analyzeQuestion("이번에 취업할 수 있을까?").intent, "possibility");
});

test("romantic intent can outweigh a workplace mention", () => {
  const result = analyzeQuestion("회사에 좋아하는 사람이 있는데 나를 어떻게 생각할까?");
  assert.equal(result.topic, "their-feelings");
  assert.equal(result.relationshipGoal, "romance");
});

test("a contact decision is distinguished from reduced contact", () => {
  assert.equal(analyzeQuestion("헤어진 사람한테 연락해도 될까?").intent, "choice");
  assert.equal(analyzeQuestion("친구 답장이 뜸해요").intent, "contact");
});

test("unknown and equally weighted topics require clarification", () => {
  assert.equal(analyzeQuestion("계속해도 될까?").topic, null);
  assert.equal(analyzeQuestion("회사와 친구 때문에 고민이에요").topic, null);
  assert.equal(analyzeQuestion("  ").intent, null);
});
