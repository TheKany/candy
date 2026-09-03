import type { TarotTypeId } from "./tarotTypes";

export type TarotReadingPositionRole =
  | "message"
  | "past"
  | "present"
  | "future"
  | "blocker"
  | "hold"
  | "opening"
  | "context"
  | "cause"
  | "outcome"
  | "advice";

export type TarotReadingPosition = {
  readingType: TarotTypeId;
  layoutId: string;
  positionId: string;
  label: string;
  role: TarotReadingPositionRole;
};

export const TAROT_READING_POSITIONS = [
  { readingType: "one", layoutId: "single", positionId: "message", label: "오늘의 메시지", role: "message" },

  { readingType: "three", layoutId: "timeline", positionId: "past", label: "과거", role: "past" },
  { readingType: "three", layoutId: "timeline", positionId: "present", label: "현재", role: "present" },
  { readingType: "three", layoutId: "timeline", positionId: "future", label: "미래", role: "future" },
  { readingType: "three", layoutId: "problem", positionId: "situation", label: "상황", role: "present" },
  { readingType: "three", layoutId: "problem", positionId: "obstacle", label: "장애물", role: "blocker" },
  { readingType: "three", layoutId: "problem", positionId: "advice", label: "조언", role: "advice" },
  { readingType: "three", layoutId: "relationship", positionId: "self", label: "나", role: "context" },
  { readingType: "three", layoutId: "relationship", positionId: "other", label: "상대", role: "context" },
  { readingType: "three", layoutId: "relationship", positionId: "connection", label: "관계", role: "present" },
  { readingType: "three", layoutId: "choice", positionId: "option-a", label: "선택 A", role: "context" },
  { readingType: "three", layoutId: "choice", positionId: "option-b", label: "선택 B", role: "context" },
  { readingType: "three", layoutId: "choice", positionId: "decision-key", label: "결정의 열쇠", role: "advice" },
  { readingType: "three", layoutId: "direction", positionId: "no", label: "NO", role: "blocker" },
  { readingType: "three", layoutId: "direction", positionId: "hold", label: "보류", role: "hold" },
  { readingType: "three", layoutId: "direction", positionId: "yes", label: "YES", role: "opening" },

  { readingType: "five", layoutId: "insight", positionId: "situation", label: "상황", role: "present" },
  { readingType: "five", layoutId: "insight", positionId: "cause", label: "원인", role: "cause" },
  { readingType: "five", layoutId: "insight", positionId: "obstacle", label: "장애물", role: "blocker" },
  { readingType: "five", layoutId: "insight", positionId: "advice", label: "조언", role: "advice" },
  { readingType: "five", layoutId: "insight", positionId: "outcome", label: "결과", role: "outcome" },

  { readingType: "celtic", layoutId: "celtic-cross", positionId: "present", label: "현재 상황", role: "present" },
  { readingType: "celtic", layoutId: "celtic-cross", positionId: "obstacle", label: "장애물", role: "blocker" },
  { readingType: "celtic", layoutId: "celtic-cross", positionId: "root", label: "내면의 원인", role: "context" },
  { readingType: "celtic", layoutId: "celtic-cross", positionId: "goal", label: "의식적인 바람", role: "context" },
  { readingType: "celtic", layoutId: "celtic-cross", positionId: "past", label: "지나간 영향", role: "past" },
  { readingType: "celtic", layoutId: "celtic-cross", positionId: "near-future", label: "다가오는 흐름", role: "future" },
  { readingType: "celtic", layoutId: "celtic-cross", positionId: "self", label: "나의 태도", role: "context" },
  { readingType: "celtic", layoutId: "celtic-cross", positionId: "environment", label: "주변 환경", role: "context" },
  { readingType: "celtic", layoutId: "celtic-cross", positionId: "hopes-fears", label: "희망과 두려움", role: "context" },
  { readingType: "celtic", layoutId: "celtic-cross", positionId: "outcome", label: "최종 흐름", role: "future" },

  { readingType: "horoscope", layoutId: "twelve-houses", positionId: "self", label: "나 자신", role: "present" },
  { readingType: "horoscope", layoutId: "twelve-houses", positionId: "money", label: "재정", role: "context" },
  { readingType: "horoscope", layoutId: "twelve-houses", positionId: "communication", label: "소통", role: "context" },
  { readingType: "horoscope", layoutId: "twelve-houses", positionId: "home", label: "가정", role: "context" },
  { readingType: "horoscope", layoutId: "twelve-houses", positionId: "creativity", label: "창의성", role: "context" },
  { readingType: "horoscope", layoutId: "twelve-houses", positionId: "routine", label: "일상과 건강", role: "context" },
  { readingType: "horoscope", layoutId: "twelve-houses", positionId: "partnership", label: "파트너십", role: "context" },
  { readingType: "horoscope", layoutId: "twelve-houses", positionId: "transformation", label: "변화와 전환", role: "context" },
  { readingType: "horoscope", layoutId: "twelve-houses", positionId: "growth", label: "성장과 시야", role: "context" },
  { readingType: "horoscope", layoutId: "twelve-houses", positionId: "career", label: "진로와 역할", role: "context" },
  { readingType: "horoscope", layoutId: "twelve-houses", positionId: "community", label: "공동체", role: "context" },
  { readingType: "horoscope", layoutId: "twelve-houses", positionId: "inner-world", label: "내면의 세계", role: "context" },
] as const satisfies readonly TarotReadingPosition[];

export const getReadingPosition = (
  readingType: TarotTypeId,
  layoutId: string,
  positionId: string,
): TarotReadingPosition | null =>
  TAROT_READING_POSITIONS.find(
    (position) =>
      position.readingType === readingType
      && position.layoutId === layoutId
      && position.positionId === positionId,
  ) ?? null;
