import test from "node:test";
import assert from "node:assert/strict";
import { analyzeGeminiQuestion } from "../util/geminiQuestion.ts";

test("question analysis uses Gemini once and validates evidence against the original question", async (t) => {
  const previous = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "test-only";
  t.after(() => { if (previous === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = previous; });
  let calls = 0;
  t.mock.method(globalThis, "fetch", async (url: string | URL | Request) => {
    calls++;
    assert.ok(String(url).startsWith("https://generativelanguage.googleapis.com/"));
    return Response.json({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: JSON.stringify({
      topic: "career", intent: "possibility", relationshipGoal: "unspecified", selfMaritalStatus: "unknown", otherMaritalStatus: "unknown",
      evidence: ["회사", "승진"], summary: "회사에서 승진할 수 있을지 궁금하시군요.", clarification: "",
    }) }] } }] });
  });
  const result = await analyzeGeminiQuestion("회사에서 승진할 수 있을까요?", new AbortController().signal);
  assert.equal(result.topic, "career");
  assert.equal(calls, 1);
});
