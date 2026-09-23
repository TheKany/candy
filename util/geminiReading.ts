import { READING_WRITER_PROMPT, readingSchema, parseWrittenReading } from "./readingWriter.ts";
import type { ReadingFailureCode } from "./readingFailure.ts";

export class GeminiReadingError extends Error {
  status: number;
  code: ReadingFailureCode;
  constructor(message: string, status: number, code: ReadingFailureCode = "unknown") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// Server-only caller. Never log the key, questions, or raw upstream errors.
export async function generateGeminiReading(context: unknown, count: number, signal: AbortSignal) {
  const response = await generateGeminiJSON(READING_WRITER_PROMPT, JSON.stringify(context), readingSchema(count), signal, 8192);
  try { return parseWrittenReading(response, count); }
  catch { throw new GeminiReadingError("해설을 끝까지 완성하지 못했어요.", 503, "incomplete"); }
}

export async function generateGeminiJSON(systemPrompt: string, input: string, schema: unknown, signal: AbortSignal, maxOutputTokens: number) {
  const key = process.env.GEMINI_API_KEY;
  if (!key || typeof window !== "undefined") throw new GeminiReadingError("AI 서버 설정을 확인해주세요.", 503, "configuration");
  const model = process.env.GEMINI_READING_MODEL || "gemini-3.6-flash";
  let response: Response;
  try {
  response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: input }] }],
      generationConfig: {
        responseMimeType: "application/json", responseJsonSchema: schema,
        temperature: 1, maxOutputTokens, thinkingConfig: { thinkingLevel: "low" },
      },
    }),
    signal: AbortSignal.any([signal, AbortSignal.timeout(90000)]), cache: "no-store",
  });
  } catch (error) {
    if (signal.aborted) throw error;
    const timeout = error instanceof Error && error.name === "TimeoutError";
    throw new GeminiReadingError(timeout ? "해설 응답 시간이 초과됐어요." : "해설 서버와의 연결이 끊겼어요.", 503, timeout ? "timeout" : "network");
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const dailyQuota = response.status === 429 && Array.isArray(body?.error?.details)
      && body.error.details.some((detail: { violations?: Array<{ quotaId?: string }> }) =>
        Array.isArray(detail?.violations) && detail.violations.some((violation) => typeof violation?.quotaId === "string" && /perday/i.test(violation.quotaId)));
    const code: ReadingFailureCode = response.status === 429 ? (dailyQuota ? "daily_quota" : "quota")
      : [400, 401, 403, 404].includes(response.status) ? "configuration"
      : response.status === 504 ? "timeout"
      : [500, 502, 503].includes(response.status) ? "busy" : "unknown";
    // Safe diagnostics only: no key, prompt, question, or upstream error body.
    console.warn("Gemini request failed", { status: response.status, code });
    throw new GeminiReadingError(response.status === 429 ? "AI 요청 한도에 도달했어요." : "해설을 준비하지 못했어요.", response.status === 429 ? 429 : 503, code);
  }
  const body = await response.json();
  const candidate = body.candidates?.[0];
  if (body.promptFeedback?.blockReason || ["SAFETY", "RECITATION", "PROHIBITED_CONTENT", "BLOCKLIST", "SPII", "IMAGE_SAFETY"].includes(candidate?.finishReason)) {
    throw new GeminiReadingError("질문을 다른 표현으로 바꿔주세요.", 422, "blocked");
  }
  if (candidate?.finishReason !== "STOP") throw new GeminiReadingError("응답을 끝까지 작성하지 못했어요. 질문을 확인하고 다시 시도해주세요.", 503, "incomplete");
  const content = candidate.content?.parts?.filter((part: { thought?: boolean; text?: string }) => !part.thought && typeof part.text === "string")
    .map((part: { text: string }) => part.text).join("");
  try {
    return JSON.parse(content || "null", (_key, value) =>
      typeof value === "string" ? value.replace(/\\n/g, "\n") : value);
  } catch { throw new GeminiReadingError("해설의 형식이 완성되지 않았어요.", 503, "incomplete"); }
}
