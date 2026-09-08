import { NextResponse } from "next/server";
import { DEFAULT_QUESTION_MODEL, QUESTION_SCHEMA, QUESTION_SYSTEM_PROMPT, parseQuestionModelOutput } from "@/util/questionModel";

export const runtime = "nodejs";
export const maxDuration = 120;
const response = (body: unknown, status = 200) => NextResponse.json(body, {
  status, headers: { "Cache-Control": "no-store" },
});

export async function POST(request: Request) {
  let question: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 12000) return response({ error: "질문은 1,000자 이내로 적어주세요." }, 400);
    question = JSON.parse(raw).question;
  } catch { return response({ error: "질문 내용을 확인해주세요." }, 400); }
  if (typeof question !== "string" || !question.trim() || question.length > 1000) {
    return response({ error: "질문은 1자 이상 1,000자 이내로 적어주세요." }, 400);
  }
  const baseUrl = process.env.QUESTION_MODEL_URL || (!process.env.VERCEL ? "http://127.0.0.1:11434" : "");
  if (!baseUrl) return response({ error: "지금은 자동으로 질문을 정리할 수 없어요. 직접 고민을 선택해주세요." }, 503);
  try {
    const upstream = await fetch(`${baseUrl.replace(/\/$/, "")}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.QUESTION_MODEL_TOKEN ? { Authorization: `Bearer ${process.env.QUESTION_MODEL_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        model: process.env.QUESTION_MODEL_NAME || DEFAULT_QUESTION_MODEL,
        messages: [{ role: "system", content: QUESTION_SYSTEM_PROMPT }, { role: "user", content: question }],
        format: QUESTION_SCHEMA, stream: false, think: false,
        options: { temperature: 0, presence_penalty: 0, num_ctx: 4096, num_predict: 700 },
        keep_alive: "10m",
      }),
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(110000)]),
      cache: "no-store",
    });
    if (!upstream.ok) throw new Error("Model unavailable");
    const result = await upstream.json();
    if (!result.done || result.done_reason === "length") throw new Error("Incomplete analysis");
    return response({ analysis: parseQuestionModelOutput(JSON.parse(result.message.content), question) });
  } catch {
    // Never log personal questions or raw model replies.
    return response({ error: "질문을 정리하지 못했어요. 다시 시도하거나 직접 고민을 선택해주세요." }, 503);
  }
}
