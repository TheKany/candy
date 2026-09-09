import { NextResponse } from "next/server";
import { analyzeGeminiQuestion } from "@/util/geminiQuestion";
import { GeminiReadingError } from "@/util/geminiReading";

export const runtime = "nodejs";
export const maxDuration = 120;
const response = (body: unknown, status = 200) => NextResponse.json(body, {
  status, headers: { "Cache-Control": "no-store" },
});

export async function POST(request: Request) {
  let question: unknown;
  let consent: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 12000) return response({ error: "질문은 1,000자 이내로 적어주세요." }, 400);
    const body = JSON.parse(raw);
    question = body?.question;
    consent = body?.externalProcessingConfirmed;
  } catch { return response({ error: "질문 내용을 확인해주세요." }, 400); }
  if (typeof question !== "string" || !question.trim() || question.length > 1000) {
    return response({ error: "질문은 1자 이상 1,000자 이내로 적어주세요." }, 400);
  }
  if (consent !== true) return response({ error: "Google 전송 안내를 확인한 뒤 질문 분석을 시작해주세요." }, 400);
  try {
    return response({ analysis: await analyzeGeminiQuestion(question.trim(), request.signal) });
  } catch (error) {
    if (error instanceof GeminiReadingError) return response({ error: error.message }, error.status);
    // Never log personal questions or raw model replies.
    return response({ error: "질문을 정리하지 못했어요. 다시 시도하거나 직접 고민을 선택해주세요." }, 503);
  }
}
