import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { getThreeCardSpread } from "@/constants/threeCardSpreads";
import { FIVE_CARD_POSITIONS } from "@/constants/fiveCardPositions";
import { CARD_READING_FOUNDATIONS } from "@/constants/cardReadingFoundations";
import { POSITION_WRITING_FOCUS } from "@/util/readingWriter";
import { generateGeminiReading, GeminiReadingError } from "@/util/geminiReading";
import type { TarotCardProfile } from "@/types/tarotReadingTypes";

export const runtime = "nodejs";
export const maxDuration = 120;
const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  let body;
  try {
    const raw = await request.text();
    if (raw.length > 16000) return reply({ error: "질문이 너무 길어요." }, 400);
    body = JSON.parse(raw);
  } catch { return reply({ error: "질문과 카드를 확인해주세요." }, 400); }
  if (!body || typeof body !== "object") return reply({ error: "질문과 카드를 확인해주세요." }, 400);
  const { mode, cardIds, question } = body;
  const count = mode === "one" ? 1 : mode === "three" ? 3 : mode === "five" ? 5 : 0;
  if (!count || typeof question !== "string" || !question.trim() || question.length > 1000
    || !Array.isArray(cardIds) || cardIds.length !== count || new Set(cardIds).size !== count
    || !cardIds.every((id) => typeof id === "number" && Number.isInteger(id) && id >= 0 && id <= 77)) {
    return reply({ error: "질문과 선택한 카드를 다시 확인해주세요." }, 400);
  }
  if (!process.env.GEMINI_API_KEY) return reply({ error: "해설 서버 설정을 확인해주세요." }, 503);
  try {
    const supabase = getSupabaseServer();
    if (!supabase) return reply({ error: "카드 정보를 불러올 수 없어요." }, 503);
    const { data, error } = await supabase.from("tarot_card_profiles")
      .select("card_id,name_ko,name_en,arcana,suit,rank,upright_keywords,reversed_keywords,upright_one_line,reversed_one_line")
      .in("card_id", cardIds);
    if (error) return reply({ error: "카드 정보를 불러오지 못했어요." }, 503);
    const profiles = (data ?? []) as TarotCardProfile[];
    const cards = cardIds.map((id: number) => profiles.find((card) => card.card_id === id));
    if (cards.some((card) => !card)) return reply({ error: "선택한 카드를 찾을 수 없어요." }, 404);
    const orderedCards = cards as TarotCardProfile[];
    const timeline = getThreeCardSpread("timeline")!;
    const positions = mode === "one"
      ? [{ id: "message", label: "한 장의 메시지", description: "질문에 대한 카드의 이야기" }]
      : mode === "three" ? timeline.positions : FIVE_CARD_POSITIONS;
    // No prior classification or canned topic prose: Gemini reads the question and cards together once.
    const written = await generateGeminiReading({
      question: question.trim(),
      cards: orderedCards.map((card, index) => ({
        position: positions[index].label, name: card.name_ko,
        meaning: CARD_READING_FOUNDATIONS[card.card_id],
        focus: POSITION_WRITING_FOCUS[positions[index].label] ?? positions[index].description,
      })),
    }, count, request.signal);
    if (mode === "one") return reply({
      card: orderedCards[0], fallback: false,
      reading: {
        card_id: cardIds[0], orientation: "upright", reading_type: "one", layout_id: "single", position_id: "message",
        headline: written.pages[0].headline, summary: written.conclusion,
        detail: written.pages[0].summary + "\n\n" + written.pages[0].detail,
        advice: written.advice, reflection_question: written.pages[0].reflectionQuestion,
      },
    });
    return reply({
      spread: mode === "three" ? "timeline" : "insight",
      spreadTitle: mode === "three" ? timeline.title : "다섯 장의 이야기",
      conclusion: written.conclusion, advice: written.advice,
      flowSummary: orderedCards.map((card, index) => positions[index].label + " · " + card.name_ko).join(" → "),
      pages: orderedCards.map((card, index) => ({
        card, positionId: positions[index].id, positionLabel: positions[index].label,
        positionDescription: positions[index].description, ...written.pages[index], fallback: false,
      })),
    });
  } catch (error) {
    if (error instanceof GeminiReadingError) return reply({ error: error.message }, error.status);
    return reply({ error: "질문에 맞춘 해설을 완성하지 못했어요. 카드는 유지되니 다시 시도해주세요." }, 503);
  }
}
