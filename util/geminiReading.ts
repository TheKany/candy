import { READING_WRITER_PROMPT, readingSchema, parseWrittenReading } from "./readingWriter.ts";

export class GeminiReadingError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Server-only caller. Never log the key, questions, or raw upstream errors.
export async function generateGeminiReading(context: unknown, count: number, signal: AbortSignal) {
  return parseWrittenReading(await generateGeminiJSON(READING_WRITER_PROMPT, JSON.stringify(context), readingSchema(count), signal, 8192), count);
}

export async function generateGeminiJSON(systemPrompt: string, input: string, schema: unknown, signal: AbortSignal, maxOutputTokens: number) {
  const key = process.env.GEMINI_API_KEY;
  if (!key || typeof window !== "undefined") throw new GeminiReadingError("AI 서버 설정을 확인해주세요.", 503);
  const model = process.env.GEMINI_READING_MODEL || "gemini-3.6-flash";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
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
  if (response.status === 429) throw new GeminiReadingError("무료 AI 요청 한도에 도달했어요. 잠시 후 다시 시도해주세요. 하루 한도를 모두 사용했다면 한도가 초기화된 뒤 이용할 수 있어요.", 429);
  if (!response.ok) throw new GeminiReadingError("Gemini 서버에 연결하지 못했어요. 잠시 후 다시 시도해주세요.", 503);
  const body = await response.json();
  const candidate = body.candidates?.[0];
  if (candidate?.finishReason !== "STOP") throw new GeminiReadingError("응답을 끝까지 작성하지 못했어요. 질문을 확인하고 다시 시도해주세요.", 503);
  const content = candidate.content?.parts?.filter((part: { thought?: boolean; text?: string }) => !part.thought && typeof part.text === "string")
    .map((part: { text: string }) => part.text).join("");
  return JSON.parse(content || "null", (_key, value) =>
    typeof value === "string" ? value.replace(/\\n/g, "\n") : value);
}
