import assert from "node:assert/strict";
import test from "node:test";
import { parseQuestionModelOutput } from "../util/questionModel.ts";

const question = "나는 결혼했고 친구로 친해지고 싶어요.";
const analysis = {
  topic: "relationships", intent: "action", relationshipGoal: "friendship",
  selfMaritalStatus: "married", otherMaritalStatus: "unknown",
  evidence: ["나는 결혼했고", "친구로 친해지고 싶어요"], summary: "친구로 가까워지고 싶은 고민이군요.", clarification: "",
};
test("accepts structured analysis with evidence from the question", () => {
  assert.equal(parseQuestionModelOutput(analysis, question).selfMaritalStatus, "married");
});
test("rejects invented evidence and unknown categories", () => {
  assert.throws(() => parseQuestionModelOutput({ ...analysis, evidence: ["상대가 기혼자"] }, question));
  assert.throws(() => parseQuestionModelOutput({ ...analysis, topic: "unknown-topic" }, question));
});
test("friendship cannot route to romantic reading data", () => {
  assert.equal(parseQuestionModelOutput({ ...analysis, topic: "relationship-flow" }, question).topic, "relationships");
});
test("dating intent without evidence cannot imply unmarried status", () => {
  const result = parseQuestionModelOutput({ ...analysis, evidence: [], selfMaritalStatus: "unmarried" }, "연애하고 싶어요");
  assert.equal(result.selfMaritalStatus, "unknown");
});
