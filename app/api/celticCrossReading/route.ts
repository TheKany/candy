import { isTarotTopicId } from "@/constants/tarotTopics";
import { getSupabaseServer } from "@/lib/supabaseServer";
import type {
  TarotCardProfile,
  TarotOrientation,
  TarotTopicReading,
} from "@/types/tarotReadingTypes";
import {
  buildCelticCrossReading,
  isValidCelticCrossSelection,
} from "@/util/celticCrossReading";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cardIds = searchParams.getAll("cardId").map(Number);
  const rawOrientations = searchParams.getAll("orientation");
  const topicId = searchParams.get("topicId");

  if (!isTarotTopicId(topicId) || !isValidCelticCrossSelection(cardIds, rawOrientations)) {
    return NextResponse.json(
      { error: "카드 열 장과 방향, 주제 정보가 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const orientations = rawOrientations as TarotOrientation[];
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase가 설정되지 않았습니다." }, { status: 503 });
  }

  const { data: profileRows, error: profileError } = await supabase
    .from("tarot_card_profiles")
    .select("card_id,name_ko,name_en,arcana,suit,rank,upright_keywords,reversed_keywords,upright_one_line,reversed_one_line")
    .in("card_id", cardIds);

  if (profileError) {
    console.error("Celtic Cross profile query failed:", profileError);
    return NextResponse.json({ error: "카드 정보를 불러오지 못했습니다." }, { status: 500 });
  }

  const profiles = (profileRows ?? []) as TarotCardProfile[];
  const cards = cardIds.map((id) => profiles.find((card) => card.card_id === id));
  if (cards.some((card) => !card)) {
    return NextResponse.json({ error: "카드 열 장을 모두 찾을 수 없습니다." }, { status: 404 });
  }

  const { data: readingRows, error: readingError } = await supabase
    .from("tarot_topic_readings")
    .select("card_id,topic_id,orientation,headline,conclusion,core_message,emotional_layer,hidden_context,challenge,opportunity,near_future,advice,reflection_question")
    .in("card_id", cardIds)
    .eq("topic_id", topicId)
    .in("orientation", ["upright", "reversed"]);

  if (readingError) {
    console.error("Celtic Cross reading query failed:", readingError);
    return NextResponse.json({ error: "타로 해석을 불러오지 못했습니다." }, { status: 500 });
  }

  const topicReadings = (readingRows ?? []) as TarotTopicReading[];
  const readings = cardIds.map((id, index) =>
    topicReadings.find((reading) =>
      reading.card_id === id && reading.orientation === orientations[index]
    ) ?? null
  );

  return NextResponse.json(
    buildCelticCrossReading(cards as TarotCardProfile[], orientations, readings),
  );
}
