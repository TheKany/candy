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

const joinSentences = (...sentences: string[]) => sentences.join(" ");

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
    conclusion: joinSentences(
      "지금의 결론은 현재의 핵심과 장애물을 함께 살피는 데 있어요.",
      pages[0].summary,
      pages[0].detail,
      pages[1].summary,
      pages[1].detail,
      "현재의 선택이 이어졌을 때 어떤 흐름이 열리는지도 확인해보세요.",
      pages[9].summary,
      pages[9].detail,
    ),
    coreConflict: joinSentences(
      "이 질문에서 서로 맞닿는 흐름을 살펴보세요.",
      pages[0].summary,
      pages[0].detail,
      pages[1].summary,
      pages[1].detail,
    ),
    innerGap: joinSentences(
      "마음 깊은 곳의 바람과 의식적인 목표를 함께 바라보세요.",
      pages[2].summary,
      pages[2].detail,
      pages[3].summary,
      pages[3].detail,
    ),
    timeline: joinSentences(
      "지나온 경험과 가까운 시기의 흐름을 차례로 살펴보세요.",
      pages[4].summary,
      pages[4].detail,
      pages[5].summary,
      pages[5].detail,
    ),
    outerInfluence: joinSentences(
      "나를 둘러싼 조건과 마음의 움직임을 함께 살펴보세요.",
      pages[6].summary,
      pages[6].detail,
      pages[7].summary,
      pages[7].detail,
      pages[8].summary,
      pages[8].detail,
    ),
    advice: readings[6]?.advice
      ?? readings[9]?.advice
      ?? getFallbackLine(cards[6], orientations[6]),
    pages,
  };
};
