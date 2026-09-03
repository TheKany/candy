import { isTarotTopicId } from "@/constants/tarotTopics";
import { getSupabaseServer } from "@/lib/supabaseServer";
import type {
  TarotCardProfile,
  TarotOrientation,
  TarotTopicReading,
} from "@/types/tarotReadingTypes";
import { buildTarotReadingResult } from "@/util/tarotReadingResult";
import { NextResponse } from "next/server";

const isOrientation = (value: string | null): value is TarotOrientation =>
  value === "upright" || value === "reversed";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cardIdValue = searchParams.get("cardId");
  const topicId = searchParams.get("topicId");
  const orientation = searchParams.get("orientation");
  const cardId = Number(cardIdValue);

  if (
    cardIdValue === null ||
    !Number.isInteger(cardId) ||
    cardId < 0 ||
    cardId > 77 ||
    !isTarotTopicId(topicId) ||
    !isOrientation(orientation)
  ) {
    return NextResponse.json(
      { error: "카드와 주제 정보가 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase가 설정되지 않았습니다." },
      { status: 503 },
    );
  }

  const { data: card, error: cardError } = await supabase
    .from("tarot_card_profiles")
    .select(
      "card_id,name_ko,name_en,arcana,suit,rank,upright_keywords,reversed_keywords,upright_one_line,reversed_one_line",
    )
    .eq("card_id", cardId)
    .maybeSingle();

  if (cardError) {
    console.error("Tarot profile query failed:", cardError);
    return NextResponse.json(
      { error: "카드 정보를 불러오지 못했습니다." },
      { status: 500 },
    );
  }

  if (!card) {
    return NextResponse.json(
      { error: "카드를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const { data: reading, error: readingError } = await supabase
    .from("tarot_topic_readings")
    .select(
      "card_id,topic_id,orientation,headline,conclusion,core_message,emotional_layer,hidden_context,challenge,opportunity,near_future,advice,reflection_question",
    )
    .eq("card_id", cardId)
    .eq("topic_id", topicId)
    .eq("orientation", orientation)
    .maybeSingle();

  if (readingError) {
    console.error("Tarot topic reading query failed:", readingError);
    return NextResponse.json(
      { error: "타로 해석을 불러오지 못했습니다." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    buildTarotReadingResult(
      card as TarotCardProfile,
      (reading as TarotTopicReading | null) ?? null,
    ),
  );
}
