import { getThreeCardSpread, type ThreeCardSpreadId } from "../constants/threeCardSpreads.ts";
import type {
  TarotCardProfile,
  TarotOrientation,
  TarotPositionReading,
} from "../types/tarotReadingTypes.ts";
import type {
  ThreeCardReadingPage,
  ThreeCardReadingResult,
} from "../types/threeCardReadingTypes.ts";

const getFallbackLine = (card: TarotCardProfile, orientation: TarotOrientation) =>
  orientation === "upright" ? card.upright_one_line : card.reversed_one_line;

const buildConclusion = (
  spread: ThreeCardSpreadId,
  pages: [ThreeCardReadingPage, ThreeCardReadingPage, ThreeCardReadingPage],
) => {
  const [first, second, third] = pages;
  switch (spread) {
    case "timeline":
      return `지나온 흐름을 보면 ${first.summary} 지금은 ${second.summary} 이 흐름을 이어가면 ${third.summary}`;
    case "problem":
      return `지금은 ${first.summary} 막히는 지점은 ${second.summary} 그래서 ${third.summary}`;
    case "relationship":
      return `나에게는 ${first.summary} 상대에게는 ${second.summary} 두 사람 사이에서는 ${third.summary}`;
    case "choice":
      return `선택 A에서는 ${first.summary} 선택 B에서는 ${second.summary} 결정을 내릴 때는 ${third.summary}`;
    case "direction":
      return `현재 답은 조건부 YES/보류/NO에 가깝습니다. 먼저 ${first.summary} 이어서 ${second.summary} 그 조건이 갖춰지면 ${third.summary}`;
  }
};

export const buildThreeCardReading = (
  spreadId: ThreeCardSpreadId,
  cards: TarotCardProfile[],
  readings: Array<TarotPositionReading | null>,
): ThreeCardReadingResult => {
  const spread = getThreeCardSpread(spreadId);
  if (!spread || cards.length !== 3 || readings.length !== 3) {
    throw new Error("쓰리카드 해석에는 배열과 카드 세 장이 필요합니다.");
  }

  const orientation = readings.find((reading) => reading)?.orientation ?? "upright";
  const pages = spread.positions.map((position, index): ThreeCardReadingPage => {
    const card = cards[index];
    const reading = readings[index];
    const fallbackLine = getFallbackLine(card, orientation);
    const content = reading
      ? { summary: reading.summary, detail: reading.detail }
      : { summary: fallbackLine, detail: `${position.description}을 중심으로 카드가 보여주는 흐름을 살펴보세요.` };

    return {
      positionId: position.id,
      positionLabel: position.label,
      positionDescription: position.description,
      card,
      headline: reading?.headline ?? `${position.label}에서 만난 ${card.name_ko}`,
      ...content,
      reflectionQuestion: reading?.reflection_question ?? `${position.label}에서 이 카드가 보여주는 흐름은 지금 질문과 어떻게 만날까요?`,
      fallback: reading === null,
    };
  });

  return {
    spread: spreadId,
    spreadTitle: spread.title,
    conclusion: buildConclusion(spreadId, pages as [ThreeCardReadingPage, ThreeCardReadingPage, ThreeCardReadingPage]),
    flowSummary: pages.map((page) => `${page.positionLabel} · ${page.card.name_ko}`).join("  →  "),
    advice: readings[2]?.advice ?? getFallbackLine(cards[2], orientation),
    pages,
  };
};
