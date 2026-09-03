import { CELTIC_CROSS_POSITIONS } from "../constants/celticCrossPositions.ts";
import type {
  TarotCardProfile,
  TarotOrientation,
  TarotPositionReading,
} from "../types/tarotReadingTypes.ts";
import type {
  CelticCrossReadingPage,
  CelticCrossReadingResult,
} from "../types/celticCrossReadingTypes.ts";

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
  readings: Array<TarotPositionReading | null>,
): CelticCrossReadingResult => {
  if (cards.length !== 10 || orientations.length !== 10 || readings.length !== 10) {
    throw new Error("켈틱 크로스 해석에는 카드와 방향이 열 개씩 필요합니다.");
  }

  const pages = CELTIC_CROSS_POSITIONS.map((position, index): CelticCrossReadingPage => {
    const card = cards[index];
    const orientation = orientations[index];
    const reading = readings[index];
    const fallbackLine = getFallbackLine(card, orientation);

    return {
      positionId: position.id,
      positionLabel: position.label,
      positionDescription: position.description,
      card,
      orientation,
      headline: reading?.headline ?? `${position.label}에서 만난 ${card.name_ko}`,
      summary: reading?.summary ?? fallbackLine,
      detail: reading?.detail
        ?? `${position.description}을 중심으로 카드가 보여주는 흐름을 살펴보세요.`,
      reflectionQuestion: reading?.reflection_question
        ?? `${position.label}에서 이 카드가 보여주는 흐름은 지금 질문에 어떤 영향을 주고 있나요?`,
      fallback: reading === null,
    };
  });

  return {
    conclusion: `지금은 ${pages[0].summary} 여기에 ${pages[1].summary} 현재의 선택이 이어지면 ${pages[9].summary}`,
    coreConflict: `질문의 중심에서는 ${pages[0].summary} 동시에 마주한 영향은 ${pages[1].summary}`,
    innerGap: `마음 깊은 곳에서는 ${pages[2].summary} 바라보는 방향은 ${pages[3].summary}`,
    timeline: `지나온 흐름에서는 ${pages[4].summary} 가까운 시기에는 ${pages[5].summary}`,
    outerInfluence: `나의 태도에서는 ${pages[6].summary} 주변에서는 ${pages[7].summary} 마음속 기대와 불안은 ${pages[8].summary}`,
    advice: readings[6]?.advice
      ?? readings[9]?.advice
      ?? getFallbackLine(cards[6], orientations[6]),
    pages,
  };
};
