import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { CARD_READING_FOUNDATIONS } from "@/constants/cardReadingFoundations";
import { generateGeminiJSON, GeminiReadingError } from "@/util/geminiReading";
import { MONTHLY_READING_PROMPT, monthlyReadingSchema, parseMonthlyReading, parseMonthlyRequest } from "@/util/monthlyReadingWriter";
import type { TarotCardProfile } from "@/types/tarotReadingTypes";

export const runtime = "nodejs";
export const maxDuration = 120;
const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  let input;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > 16000) return reply({ code: "unknown" }, 400);
    input = parseMonthlyRequest(JSON.parse(raw));
  } catch { return reply({ code: "unknown" }, 400); }
  if (!input) return reply({ code: "unknown" }, 400);
  const { year, startMonth, cardIds } = input;
  const months = Array.from({ length: 13 - startMonth }, (_, i) => startMonth + i);
  try {
    const supabase = getSupabaseServer();
    if (!supabase || !process.env.GEMINI_API_KEY) return reply({ code: "configuration" }, 503);
    const { data, error } = await supabase.from("tarot_card_profiles")
      .select("card_id,name_ko,name_en,arcana,suit,rank,upright_keywords,reversed_keywords,upright_one_line,reversed_one_line")
      .in("card_id", cardIds);
    if (error) return reply({ code: "unknown" }, 503);
    const cards = cardIds.map(id => (data as TarotCardProfile[] | null)?.find(card => card.card_id === id));
    if (cards.some(card => !card)) return reply({ code: "configuration" }, 503);
    const orderedCards = cards as TarotCardProfile[];
    const written = await generateGeminiJSON(MONTHLY_READING_PROMPT, JSON.stringify({ year,
      cards: orderedCards.map((card, i) => ({ month: months[i], cardId: card.card_id, name: card.name_ko, meaning: CARD_READING_FOUNDATIONS[card.card_id] })),
    }), monthlyReadingSchema(months.length), request.signal, 16384);
    let pages;
    try { pages = parseMonthlyReading(written, { year, startMonth, months }, cardIds); }
    catch { return reply({ code: "incomplete" }, 503); }
    return reply({ year, pages, cards: orderedCards });
  } catch (error) {
    if (error instanceof GeminiReadingError) return reply({ code: error.code }, error.status);
    return reply({ code: "unknown" }, 503);
  }
}
