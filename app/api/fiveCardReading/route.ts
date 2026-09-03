import { FIVE_CARD_POSITIONS } from "@/constants/fiveCardPositions";
import { isTarotTopicId } from "@/constants/tarotTopics";
import { getSupabaseServer } from "@/lib/supabaseServer";
import type {
  TarotCardProfile,
  TarotPositionReading,
  TarotTopicReading,
} from "@/types/tarotReadingTypes";
import { buildFiveCardReading } from "@/util/fiveCardReading";
import { buildPositionReadingTupleFilter } from "@/util/tarotPositionReadingQuery";
import { NextResponse } from "next/server";

const POSITION_READING_COLUMNS =
  "card_id,topic_id,orientation,reading_type,layout_id,position_id,headline,summary,detail,advice,reflection_question";

const adaptTopicReading = (
  reading: TarotTopicReading,
  positionId: string,
): TarotPositionReading => ({
  card_id: reading.card_id,
  topic_id: reading.topic_id,
  orientation: "upright",
  reading_type: "five",
  layout_id: "insight",
  position_id: positionId,
  headline: reading.headline,
  summary: reading.conclusion,
  detail: reading.core_message,
  advice: reading.advice,
  reflection_question: reading.reflection_question,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cardIds = searchParams.getAll("cardId").map(Number);
  const topicId = searchParams.get("topicId");
  const hasValidCards = cardIds.length === 5
    && new Set(cardIds).size === 5
    && cardIds.every((id) => Number.isInteger(id) && id >= 0 && id <= 77);

  if (!hasValidCards || !isTarotTopicId(topicId)) {
    return NextResponse.json(
      { error: "카드 다섯 장과 주제 정보가 올바르지 않습니다." },
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
    console.error("Five-card profile query failed:", profileError);
    return NextResponse.json({ error: "카드 정보를 불러오지 못했습니다." }, { status: 500 });
  }

  const profiles = (profileRows ?? []) as TarotCardProfile[];
  const cards = cardIds.map((id) => profiles.find((card) => card.card_id === id));
  if (cards.some((card) => !card)) {
    return NextResponse.json({ error: "카드 다섯 장을 모두 찾을 수 없습니다." }, { status: 404 });
  }

  const readingTuples = cardIds.map((cardId, index) => ({
    cardId,
    positionId: FIVE_CARD_POSITIONS[index].id,
    orientation: "upright" as const,
  }));
  const { data: readingRows, error: readingError } = await supabase
    .from("tarot_position_readings")
    .select(POSITION_READING_COLUMNS)
    .eq("topic_id", topicId)
    .eq("reading_type", "five")
    .eq("layout_id", "insight")
    .or(buildPositionReadingTupleFilter(readingTuples));

  if (readingError) {
    console.error("Five-card position reading query failed:", readingError);
    return NextResponse.json({ error: "타로 해석을 불러오지 못했습니다." }, { status: 500 });
  }

  const positionReadings = (readingRows ?? []) as TarotPositionReading[];
  const missingCardIds = cardIds.filter((id, index) =>
    !positionReadings.some((reading) =>
      reading.card_id === id
      && reading.position_id === FIVE_CARD_POSITIONS[index].id
      && reading.orientation === "upright"
    )
  );

  let topicReadings: TarotTopicReading[] = [];
  if (missingCardIds.length > 0) {
    const { data: legacyRows, error: legacyError } = await supabase
      .from("tarot_topic_readings")
      .select("card_id,topic_id,orientation,headline,conclusion,core_message,emotional_layer,hidden_context,challenge,opportunity,near_future,advice,reflection_question")
      .in("card_id", missingCardIds)
      .eq("topic_id", topicId)
      .eq("orientation", "upright");

    if (legacyError) {
      console.error("Five-card topic fallback query failed:", legacyError);
      return NextResponse.json({ error: "타로 해석을 불러오지 못했습니다." }, { status: 500 });
    }
    topicReadings = (legacyRows ?? []) as TarotTopicReading[];
  }

  const readings = cardIds.map((id, index) => {
    const positionId = FIVE_CARD_POSITIONS[index].id;
    return positionReadings.find((reading) =>
      reading.card_id === id
      && reading.position_id === positionId
      && reading.orientation === "upright"
    ) ?? (
      topicReadings.find((reading) => reading.card_id === id)
        ? adaptTopicReading(topicReadings.find((reading) => reading.card_id === id)!, positionId)
        : null
    );
  });

  return NextResponse.json(
    buildFiveCardReading(cards as TarotCardProfile[], readings),
  );
}
