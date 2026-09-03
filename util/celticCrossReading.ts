import { CELTIC_CROSS_POSITIONS } from "../constants/celticCrossPositions.ts";
import type {
  TarotCardProfile,
  TarotOrientation,
  TarotTopicReading,
} from "../types/tarotReadingTypes.ts";
import type {
  CelticCrossReadingPage,
  CelticCrossReadingResult,
} from "../types/celticCrossReadingTypes.ts";

type ReadingField = keyof Pick<
  TarotTopicReading,
  | "core_message"
  | "emotional_layer"
  | "hidden_context"
  | "challenge"
  | "opportunity"
  | "near_future"
  | "advice"
>;

const POSITION_FIELDS: Record<string, readonly [ReadingField, ReadingField]> = {
  present: ["core_message", "emotional_layer"],
  obstacle: ["challenge", "hidden_context"],
  root: ["hidden_context", "emotional_layer"],
  goal: ["opportunity", "core_message"],
  past: ["hidden_context", "core_message"],
  "near-future": ["near_future", "opportunity"],
  self: ["emotional_layer", "advice"],
  environment: ["hidden_context", "challenge"],
  "hopes-fears": ["emotional_layer", "challenge"],
  outcome: ["near_future", "opportunity"],
};

const getKeyword = (card: TarotCardProfile, orientation: TarotOrientation) =>
  (orientation === "upright" ? card.upright_keywords : card.reversed_keywords)[0]
  ?? card.name_ko;

const getFallbackLine = (card: TarotCardProfile, orientation: TarotOrientation) =>
  orientation === "upright" ? card.upright_one_line : card.reversed_one_line;

export const isValidCelticCrossSelection = (
  cardIds: number[],
  orientations: string[],
): boolean => cardIds.length === 10
  && new Set(cardIds).size === 10
  && cardIds.every((id) => Number.isInteger(id) && id >= 0 && id <= 77)
  && orientations.length === 10
  && orientations.every((orientation) => orientation === "upright" || orientation === "reversed");

export const buildCelticCrossReading = (
  cards: TarotCardProfile[],
  orientations: TarotOrientation[],
  readings: Array<TarotTopicReading | null>,
): CelticCrossReadingResult => {
  if (cards.length !== 10 || orientations.length !== 10 || readings.length !== 10) {
    throw new Error("켈틱 크로스 해석에는 카드와 방향이 열 개씩 필요합니다.");
  }

  const keywords = cards.map((card, index) => getKeyword(card, orientations[index]));
  const pages = CELTIC_CROSS_POSITIONS.map((position, index): CelticCrossReadingPage => {
    const card = cards[index];
    const orientation = orientations[index];
    const reading = readings[index];
    const fallbackLine = getFallbackLine(card, orientation);
    const [summaryField, detailField] = POSITION_FIELDS[position.id];

    return {
      positionId: position.id,
      positionLabel: position.label,
      positionDescription: position.description,
      card,
      orientation,
      headline: reading?.headline ?? `${position.label}에서 만난 ${card.name_ko}`,
      summary: reading?.[summaryField] ?? fallbackLine,
      detail: reading?.[detailField]
        ?? `${position.description}을 중심으로 “${keywords[index]}”의 의미를 살펴보세요.`,
      reflectionQuestion: reading?.reflection_question
        ?? `“${keywords[index]}”이 ${position.label}에 어떤 영향을 주고 있나요?`,
      fallback: reading === null,
    };
  });

  return {
    conclusion: `지금은 “${keywords[0]}”의 상황에 “${keywords[1]}”의 과제가 겹쳐 있습니다. 흐름을 바꾸는 열쇠는 “${keywords[6]}”의 태도이며, 현재 선택이 이어지면 “${keywords[9]}”의 가능성으로 향해요.`,
    coreConflict: `현재 상황의 “${keywords[0]}”와 장애물의 “${keywords[1]}”이 맞물려 이번 질문의 핵심 긴장을 만들고 있습니다.`,
    innerGap: `내면의 원인에는 “${keywords[2]}”가, 의식적인 바람에는 “${keywords[3]}”가 보여요. 두 방향의 차이를 인정해야 원하는 것을 현실적인 선택으로 바꿀 수 있습니다.`,
    timeline: `지나간 영향의 “${keywords[4]}”는 서서히 힘을 잃고, 다가오는 흐름의 “${keywords[5]}”가 새로운 변수로 들어옵니다.`,
    outerInfluence: `나의 태도 “${keywords[6]}”, 주변 환경 “${keywords[7]}”, 희망과 두려움 “${keywords[8]}”이 함께 최종 흐름의 강도를 결정합니다.`,
    advice: readings[6]?.advice
      ?? readings[9]?.advice
      ?? getFallbackLine(cards[6], orientations[6]),
    pages,
  };
};
