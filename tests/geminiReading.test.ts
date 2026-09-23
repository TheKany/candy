import test from "node:test";
import assert from "node:assert/strict";

test("응답 본문 수신 중 끊김과 시간 초과도 해당 오류 화면 코드로 전달한다", async (t) => {
  const originalKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "test-only";
  t.after(() => { if (originalKey === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = originalKey; });
  for (const [failure, expected] of [[new TypeError("connection lost"), "network"], [new DOMException("late", "TimeoutError"), "timeout"]] as const) {
    const response = new Response(new ReadableStream({ start(controller) { controller.error(failure); } }));
    const mock = t.mock.method(globalThis, "fetch", async () => response);
    await assert.rejects(() => generateGeminiReading({}, 1, new AbortController().signal), (error: unknown) => error instanceof GeminiReadingError && error.code === expected);
    mock.mock.restore();
  }
});
import { generateGeminiReading, GeminiReadingError } from "../util/geminiReading.ts";

test("오류 코드는 과부하·설정·일일 한도·일반 한도를 구분한다", async (t) => {
  const originalKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "test-only";
  t.after(() => { if (originalKey === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = originalKey; });
  for (const [status, details, expected] of [
    [503, [], "busy"], [403, [], "configuration"],
    [429, [], "quota"],
    [429, [{ violations: [{ quotaId: "GenerateRequestsPerDayPerProjectPerModel-FreeTier" }] }], "daily_quota"],
  ] as const) {
    const mock = t.mock.method(globalThis, "fetch", async () => Response.json({ error: { details } }, { status }));
    await assert.rejects(() => generateGeminiReading({}, 1, new AbortController().signal), (error: unknown) => {
      assert.ok(error instanceof GeminiReadingError);
      assert.equal((error as GeminiReadingError & { code: string }).code, expected);
      return true;
    });
    mock.mock.restore();
  }
});

test("Gemini quota errors stop without retrying or exposing upstream details", async (t) => {
  const originalKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "test-only";
  t.after(() => { if (originalKey === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = originalKey; });
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => {
    calls++;
    return Response.json({ error: { message: "private-upstream-details" } }, { status: 429 });
  });
  await assert.rejects(() => generateGeminiReading({}, 1, new AbortController().signal), (error: unknown) => {
    assert.ok(error instanceof GeminiReadingError);
    assert.equal(error.status, 429);
    assert.match(error.message, /한도/);
    assert.doesNotMatch(error.message, /private-upstream-details/);
    return true;
  });
  assert.equal(calls, 1);
});

test("Gemini returns visible reading text without thoughts and normalizes escaped paragraph breaks", async (t) => {
  const originalKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "test-only";
  t.after(() => { if (originalKey === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = originalKey; });
  const detail = "지금 배운 업무를 직접 정리하면서 모르는 부분과 익숙해진 부분을 나누어보세요. ".repeat(3)
    + "\\n\\n" + "먼저 업무 기준을 확인한 뒤 동료에게 구체적인 질문을 건네보는 것이 좋아요. ".repeat(3);
  t.mock.method(globalThis, "fetch", async () => Response.json({ candidates: [{ finishReason: "STOP", content: { parts: [
    { thought: true, text: "internal reasoning" },
    { text: JSON.stringify({ conclusion: "새로운 일을 익힐 때는 기준을 확인하고 구체적인 질문부터 하나씩 건네보세요.",
      followUpQuestions: ["지금 어떤 행동부터 하면 좋을까요?", "내가 놓친 부분은 무엇일까요?"],
      contextSummary: "새로운 업무를 배우는 상황에서 기준과 모르는 부분을 확인하기로 살펴본 상담이에요.",
      advice: "매일 배운 내용을 정리하고 궁금한 점을 모아보세요. 질문하기 전에 스스로 확인한 부분을 짚어주면 대화가 더 쉬워져요. 아직 답을 듣지 못했다면 지금 할 수 있는 일부터 해보세요.",
      pages: [{ headline: "기준을 익히는 시간", summary: "지금은 배우는 과정이니 필요한 기준을 먼저 확인해보세요.", detail, reflectionQuestion: "지금 가장 먼저 확인할 기준은 무엇인가요?" }],
    }) },
  ] } }] }));
  const reading = await generateGeminiReading({}, 1, new AbortController().signal);
  assert.ok(reading.pages[0].detail.includes("\n\n"));
  assert.ok(!reading.pages[0].detail.includes("\\n"));
  assert.ok(!JSON.stringify(reading).includes("internal reasoning"));
});
