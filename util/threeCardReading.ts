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

const joinSentences = (...sentences: string[]) => sentences.join(" ");

const buildConclusion = (
  spread: ThreeCardSpreadId,
  pages: [ThreeCardReadingPage, ThreeCardReadingPage, ThreeCardReadingPage],
) => {
  const [first, second, third] = pages;
  switch (spread) {
    case "timeline":
      return joinSentences(
        "지나온 흐름이 지금의 판단에 영향을 주고 있어요.",
        first.summary,
        "현재의 상황을 천천히 확인해보세요.",
        second.summary,
        "앞으로의 가능성은 지금의 선택에서 자라나요.",
        third.summary,
      );
    case "problem":
      return joinSentences(
        "문제의 중심을 먼저 살펴보세요.",
        first.summary,
        "다음으로 흐름을 막는 지점을 확인해보세요.",
        second.summary,
        "이제 가능한 행동을 선택해보세요.",
        third.summary,
      );
    case "relationship":
      return joinSentences(
        "내 마음의 흐름부터 살펴보세요.",
        first.summary,
        "상대에게는 이런 흐름이 보입니다.",
        second.summary,
        "두 사람 사이에는 이런 방향이 놓여 있어요.",
        third.summary,
      );
    case "choice":
      return joinSentences(
        "두 선택을 서두르지 말고 각각 살펴보세요.",
        first.summary,
        "다른 선택에도 이런 가능성이 있습니다.",
        second.summary,
        "결정할 때는 이 기준을 마음에 두세요.",
        third.summary,
      );
    case "direction":
      return joinSentences(
        "현재 답은 조건부 YES/보류/NO에 가깝습니다.",
        "먼저 피하거나 멈춰야 할 조건을 살펴보세요.",
        first.summary,
        "결정을 미루고 확인할 내용이 있어요.",
        second.summary,
        "움직일 수 있는 조건은 여기에서 열립니다.",
        third.summary,
      );
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
