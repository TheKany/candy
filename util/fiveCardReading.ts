import { FIVE_CARD_POSITIONS } from "../constants/fiveCardPositions.ts";
import type {
  TarotCardProfile,
  TarotPositionReading,
} from "../types/tarotReadingTypes.ts";
import type {
  FiveCardReadingPage,
  FiveCardReadingResult,
} from "../types/fiveCardReadingTypes.ts";

export const buildFiveCardReading = (
  cards: TarotCardProfile[],
  readings: Array<TarotPositionReading | null>,
): FiveCardReadingResult => {
  if (cards.length !== 5 || readings.length !== 5) {
    throw new Error("파이브카드 해석에는 카드 다섯 장이 필요합니다.");
  }

  const pages = FIVE_CARD_POSITIONS.map((position, index): FiveCardReadingPage => {
    const card = cards[index];
    const reading = readings[index];
    const fallbackLine = card.upright_one_line;

    return {
      positionId: position.id,
      positionLabel: position.label,
      positionDescription: position.description,
      card,
      headline: reading?.headline ?? `${position.label}에서 만난 ${card.name_ko}`,
      summary: reading?.summary ?? fallbackLine,
      detail: reading?.detail ?? `${position.description}을 중심으로 카드가 보여주는 흐름을 살펴보세요.`,
      reflectionQuestion: reading?.reflection_question ?? `이 카드가 보여주는 ${position.label}의 의미는 지금 질문과 어떻게 이어질까요?`,
      fallback: reading === null,
    };
  });

  return {
    spreadTitle: "다섯 장의 통찰",
    conclusion: `${pages[0].summary} ${pages[4].summary}`,
    flowSummary: pages.map((page) => `${page.positionLabel} · ${page.card.name_ko}`).join("  →  "),
    advice: readings[3]?.advice ?? cards[3].upright_one_line,
    pages,
  };
};
