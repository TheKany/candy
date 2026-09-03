import { getThreeCardSpread } from "@/constants/threeCardSpreads";
import { isTarotTopicId } from "@/constants/tarotTopics";
import { getSupabaseServer } from "@/lib/supabaseServer";
import type {
  TarotCardProfile,
  TarotOrientation,
  TarotTopicReading,
} from "@/types/tarotReadingTypes";
import { buildThreeCardReading } from "@/util/threeCardReading";
import { NextResponse } from "next/server";

const isOrientation = (value: string | null): value is TarotOrientation =>
  value === "upright" || value === "reversed";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cardIds = searchParams.getAll("cardId").map(Number);
  const topicId = searchParams.get("topicId");
  const spread = getThreeCardSpread(searchParams.get("spreadId"));
  const orientation = searchParams.get("orientation");
  const hasValidCards = cardIds.length === 3
    && new Set(cardIds).size === 3
    && cardIds.every((id) => Number.isInteger(id) && id >= 0 && id <= 77);

  if (!hasValidCards || !isTarotTopicId(topicId) || !spread || !isOrientation(orientation)) {
    return NextResponse.json(
      { error: "카드 세 장과 배열, 주제 정보가 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase가 설정되지 않았습니다." }, { status: 503 });
  }

  const { data: profileRows, error: profileError } = await supabase
    .from("tarot_card_profiles")
    .select("card_id,name_ko,name_en,arcana,suit,rank,upright_keywords,reversed_keywords,upright_one_line,reversed_one_line")
    .in("card_id", cardIds);

  if (profileError) {
    console.error("Three-card profile query failed:", profileError);
    return NextResponse.json({ error: "카드 정보를 불러오지 못했습니다." }, { status: 500 });
  }

  const profiles = (profileRows ?? []) as TarotCardProfile[];
  const cards = cardIds.map((id) => profiles.find((card) => card.card_id === id));
  if (cards.some((card) => !card)) {
    return NextResponse.json({ error: "카드 세 장을 모두 찾을 수 없습니다." }, { status: 404 });
  }

  const { data: readingRows, error: readingError } = await supabase
    .from("tarot_topic_readings")
    .select("card_id,topic_id,orientation,headline,conclusion,core_message,emotional_layer,hidden_context,challenge,opportunity,near_future,advice,reflection_question")
    .in("card_id", cardIds)
    .eq("topic_id", topicId)
    .eq("orientation", orientation);

  if (readingError) {
    console.error("Three-card reading query failed:", readingError);
    return NextResponse.json({ error: "타로 해석을 불러오지 못했습니다." }, { status: 500 });
  }

  const topicReadings = (readingRows ?? []) as TarotTopicReading[];
  const readings = cardIds.map((id) => topicReadings.find((reading) => reading.card_id === id) ?? null);

  return NextResponse.json(
    buildThreeCardReading(spread.id, cards as TarotCardProfile[], readings),
  );
}
