import { NextResponse } from "next/server";
import { GET as oneReading } from "../tarotReading/route";
import { GET as threeReading } from "../threeCardReading/route";
import { GET as fiveReading } from "../fiveCardReading/route";
import { isTarotTopicId, getTarotTopic } from "@/constants/tarotTopics";
import { QUESTION_INTENTS } from "@/util/analyzeQuestion";
import { READING_WRITER_PROMPT, POSITION_WRITING_FOCUS, readingSchema, parseWrittenReading } from "@/util/readingWriter";
import type { TarotReadingResult } from "@/types/tarotReadingTypes";
import type { ThreeCardReadingResult } from "@/types/threeCardReadingTypes";
import { CARD_READING_FOUNDATIONS } from "@/constants/cardReadingFoundations";
import { generateGeminiReading, GeminiReadingError } from "@/util/geminiReading";

export const runtime = "nodejs";
export const maxDuration = 300;
const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  let body;
  try {
    const raw = await request.text();
    if (raw.length > 16000) return reply({ error: "질문이 너무 길어요." }, 400);
    body = JSON.parse(raw);
  } catch { return reply({ error: "질문과 카드를 확인해주세요." }, 400); }
  if (!body || typeof body !== "object") return reply({ error: "질문과 카드를 확인해주세요." }, 400);
  const { mode, cardIds, topicId, question, analysis } = body;
  const count = mode === "one" ? 1 : mode === "three" ? 3 : mode === "five" ? 5 : 0;
  if (!count || !isTarotTopicId(topicId) || typeof question !== "string" || !question.trim() || question.length > 1000
    || !Array.isArray(cardIds) || cardIds.length !== count || new Set(cardIds).size !== count
    || !cardIds.every((id) => typeof id === "number" && Number.isInteger(id) && id >= 0 && id <= 77)
    || !analysis || analysis.topic !== topicId || !QUESTION_INTENTS.some((item) => item.id === analysis.intent)
    || !["friendship", "romance", "unspecified"].includes(analysis.relationshipGoal)
    || (analysis.summary !== undefined && (typeof analysis.summary !== "string" || analysis.summary.length > 600))) {
    return reply({ error: "확인한 질문과 선택한 카드를 다시 확인해주세요." }, 400);
  }
  const baseUrl = process.env.QUESTION_MODEL_URL || (!process.env.VERCEL ? "http://127.0.0.1:11434" : "");
  const useGemini = Boolean(process.env.GEMINI_API_KEY);
  if (useGemini && body.externalProcessingConfirmed !== true) return reply({ error: "Google 전송 안내를 확인한 뒤 해설을 시작해주세요." }, 400);
  if (!useGemini && !baseUrl) return reply({ error: "질문에 맞춘 해설 서버에 연결할 수 없어요." }, 503);
  try {
    const params = new URLSearchParams({ topicId, orientation: "upright", spreadId: "timeline" });
    cardIds.forEach((id) => params.append("cardId", String(id)));
    const baseRequest = new Request(`http://internal/reading?${params}`);
    const baseResponse = await (mode === "one" ? oneReading : mode === "three" ? threeReading : fiveReading)(baseRequest);
    if (!baseResponse.ok) return reply({ error: "기본 카드 해석을 불러오지 못했어요." }, baseResponse.status);
    const base = await baseResponse.json();
    const cards = mode === "one"
      ? [{ position: "한 장의 메시지", card: (base as TarotReadingResult).card }]
      : (base as ThreeCardReadingResult).pages.map((page) => ({
        position: page.positionLabel, card: page.card,
      }));
    // Send only the confirmed fields, never arbitrary client-provided prompts.
    const context = {
      question, confirmedSummary: analysis.summary ?? "", topic: getTarotTopic(topicId)?.title,
      intent: QUESTION_INTENTS.find((item) => item.id === analysis.intent)?.label,
      relationshipGoal: analysis.relationshipGoal,
      selfMaritalStatus: ["married", "unmarried"].includes(analysis.selfMaritalStatus) ? analysis.selfMaritalStatus : "unknown",
      otherMaritalStatus: ["married", "unmarried"].includes(analysis.otherMaritalStatus) ? analysis.otherMaritalStatus : "unknown",
      cards: cards.map((entry) => ({ position: entry.position, name: entry.card.name_ko,
        focus: POSITION_WRITING_FOCUS[entry.position] ?? "이 자리의 의미를 실제 질문과 연결하고, 질문에 없는 사건과 상대의 의도를 만들어내지 않는다.",
        meaning: CARD_READING_FOUNDATIONS[entry.card.card_id],
      })),
    };
    let written;
    if (useGemini) {
      written = await generateGeminiReading(context, count, request.signal);
    } else {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/chat`, {
      method: "POST", headers: { "Content-Type": "application/json",
        ...(process.env.QUESTION_MODEL_TOKEN ? { Authorization: `Bearer ${process.env.QUESTION_MODEL_TOKEN}` } : {}),
      },
      body: JSON.stringify({ model: process.env.READING_MODEL_NAME || "qwen3.5:9b",
        messages: [{ role: "system", content: READING_WRITER_PROMPT }, { role: "user", content: JSON.stringify(context) }],
        format: readingSchema(count), stream: false, think: false,
        options: { temperature: 0.3, presence_penalty: 0, num_ctx: 8192, num_predict: 3600 }, keep_alive: "10m",
      }),
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(275000)]), cache: "no-store",
    });
    if (!response.ok) throw new Error("Writer unavailable");
    const generated = await response.json();
    if (!generated.done || generated.done_reason === "length") throw new Error("Incomplete reading");
    written = parseWrittenReading(JSON.parse(generated.message.content), count);
    }
    if (mode === "one") return reply({ ...base, fallback: false, reading: {
      ...(base.reading ?? {}), card_id: cardIds[0], topic_id: topicId, orientation: "upright", reading_type: "one", layout_id: "single", position_id: "message",
      headline: written.pages[0].headline, summary: written.conclusion,
      detail: `${written.pages[0].summary}\n\n${written.pages[0].detail}`,
      advice: written.advice, reflection_question: written.pages[0].reflectionQuestion,
    } });
    return reply({ ...base, conclusion: written.conclusion, advice: written.advice,
      pages: (base as ThreeCardReadingResult).pages.map((page, index) => ({ ...page, ...written.pages[index], fallback: false })),
    });
  } catch (error) {
    if (error instanceof GeminiReadingError) return reply({ error: error.message }, error.status);
    return reply({ error: "질문에 맞춘 해설을 완성하지 못했어요. 카드는 유지되니 다시 시도해주세요." }, 503);
  }
}
