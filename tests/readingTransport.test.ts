import test from "node:test";
import assert from "node:assert/strict";

test("응답 본문 수신 중 끊김과 시간 초과도 해당 오류 화면 코드로 전달한다", async (t) => {
  for (const [failure, expected] of [[new TypeError("connection lost"), "network"], [new DOMException("late", "TimeoutError"), "timeout"]] as const) {
    const response = new Response(new ReadableStream({ start(controller) { controller.error(failure); } }));
    const mock = t.mock.method(globalThis, "fetch", async () => response);
    await assert.rejects(() => requestPersonalReading({}, new AbortController().signal), (error: unknown) => error instanceof ReadingRequestError && error.code === expected);
    mock.mock.restore();
  }
});
import { requestPersonalReading } from "../util/readingTransport.ts";
import { ReadingRequestError } from "../util/readingFailure.ts";

test("일시적 서버 오류만 같은 요청으로 한 번 재시도한다", async (t) => {
  const payloads: string[] = [];
  let notices = 0;
  t.mock.method(globalThis, "fetch", async (_url: unknown, init?: RequestInit) => {
    payloads.push(String(init?.body));
    return payloads.length === 1 ? Response.json({ code: "busy" }, { status: 503 }) : Response.json({ reading: "ready" });
  });
  const result = await requestPersonalReading({ question: "질문", cardIds: [1] }, new AbortController().signal, () => { notices++; });
  assert.equal(result.reading, "ready"); assert.equal(payloads.length, 2);
  assert.equal(payloads[0], payloads[1]); assert.equal(notices, 1);
});

test("한도·설정·불완전 응답은 자동 재시도하지 않는다", async (t) => {
  for (const code of ["quota", "daily_quota", "configuration", "incomplete", "timeout"]) {
    let calls = 0;
    const mock = t.mock.method(globalThis, "fetch", async () => { calls++; return Response.json({ code }, { status: 503 }); });
    await assert.rejects(() => requestPersonalReading({}, new AbortController().signal), (error: unknown) => error instanceof ReadingRequestError && error.code === code);
    assert.equal(calls, 1); mock.mock.restore();
  }
});

test("재시도 대기 중 화면을 떠나면 추가 요청을 보내지 않는다", async (t) => {
  let calls = 0;
  const controller = new AbortController();
  t.mock.method(globalThis, "fetch", async () => { calls++; return Response.json({ code: "busy" }, { status: 503 }); });
  await assert.rejects(() => requestPersonalReading({}, controller.signal, () => controller.abort()), { name: "AbortError" });
  assert.equal(calls, 1);
});

test("재시도가 실패해도 세 번째 요청은 보내지 않는다", async (t) => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => { calls++; return Response.json({ code: "busy" }, { status: 503 }); });
  await assert.rejects(() => requestPersonalReading({}, new AbortController().signal), (error: unknown) => error instanceof ReadingRequestError && error.code === "busy");
  assert.equal(calls, 2);
});
