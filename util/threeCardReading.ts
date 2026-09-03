import { getThreeCardSpread, type ThreeCardSpreadId } from "../constants/threeCardSpreads.ts";
import type {
  TarotCardProfile,
  TarotOrientation,
  TarotTopicReading,
} from "../types/tarotReadingTypes.ts";
import type {
  ThreeCardReadingPage,
  ThreeCardReadingResult,
} from "../types/threeCardReadingTypes.ts";

const getKeyword = (card: TarotCardProfile, orientation: TarotOrientation) =>
  (orientation === "upright" ? card.upright_keywords : card.reversed_keywords)[0] ?? card.name_ko;

const getFallbackLine = (card: TarotCardProfile, orientation: TarotOrientation) =>
  orientation === "upright" ? card.upright_one_line : card.reversed_one_line;

const getPositionContent = (
  positionId: string,
  reading: TarotTopicReading,
): Pick<ThreeCardReadingPage, "summary" | "detail"> => {
  switch (positionId) {
    case "past":
      return { summary: reading.hidden_context, detail: reading.core_message };
    case "present":
    case "situation":
      return { summary: reading.core_message, detail: reading.emotional_layer };
    case "future":
    case "connection":
      return { summary: reading.near_future, detail: reading.opportunity };
    case "obstacle":
    case "no":
      return { summary: reading.challenge, detail: reading.hidden_context };
    case "advice":
    case "decision-key":
      return { summary: reading.advice, detail: reading.opportunity };
    case "self":
      return { summary: reading.emotional_layer, detail: reading.core_message };
    case "other":
    case "hold":
      return { summary: reading.hidden_context, detail: reading.emotional_layer };
    case "option-a":
    case "option-b":
    case "yes":
      return { summary: reading.opportunity, detail: reading.near_future };
    default:
      return { summary: reading.core_message, detail: reading.advice };
  }
};

const buildConclusion = (
  spread: ThreeCardSpreadId,
  keywords: [string, string, string],
) => {
  const [first, second, third] = keywords;
  switch (spread) {
    case "timeline":
      return `과거의 “${first}” 영향이 현재의 “${second}” 흐름으로 이어졌습니다. 미래에는 “${third}”의 가능성을 키우는 선택이 중요해요.`;
    case "problem":
      return `현재 상황의 핵심은 “${first}”입니다. 장애물 쪽에는 “${second}” 흐름이 보이며, 해법은 “${third}”의 방향에서 찾아볼 수 있어요.`;
    case "relationship":
      return `나는 “${first}”, 상대는 “${second}”의 흐름에 가깝습니다. 두 사람이 “${third}”의 의미를 함께 다룰 때 관계의 방향이 선명해져요.`;
    case "choice":
      return `선택 A에는 “${first}”, 선택 B에는 “${second}”의 가능성이 있습니다. 가장 중요한 결정 기준은 “${third}”입니다.`;
    case "direction":
      return `지금 막는 신호는 “${first}”, 보류하고 확인할 변수는 “${second}”입니다. “${third}” 관련 변화가 현실에서 확인될 때 YES의 가능성을 여는 조건이 갖춰져요.`;
  }
};

export const buildThreeCardReading = (
  spreadId: ThreeCardSpreadId,
  cards: TarotCardProfile[],
  readings: Array<TarotTopicReading | null>,
): ThreeCardReadingResult => {
  const spread = getThreeCardSpread(spreadId);
  if (!spread || cards.length !== 3 || readings.length !== 3) {
    throw new Error("쓰리카드 해석에는 배열과 카드 세 장이 필요합니다.");
  }

  const orientation = readings.find((reading) => reading)?.orientation ?? "upright";
  const keywords = cards.map((card) => getKeyword(card, orientation)) as [string, string, string];
  const pages = spread.positions.map((position, index): ThreeCardReadingPage => {
    const card = cards[index];
    const reading = readings[index];
    const fallbackLine = getFallbackLine(card, orientation);
    const content = reading
      ? getPositionContent(position.id, reading)
      : { summary: fallbackLine, detail: `${position.description}을 중심으로 이 카드의 메시지를 살펴보세요.` };

    return {
      positionId: position.id,
      positionLabel: position.label,
      positionDescription: position.description,
      card,
      headline: reading?.headline ?? `${position.label}에서 만난 ${card.name_ko}`,
      ...content,
      reflectionQuestion: reading?.reflection_question ?? `“${keywords[index]}”이 지금 질문과 만나는 지점은 무엇인가요?`,
      fallback: reading === null,
    };
  });

  return {
    spread: spreadId,
    spreadTitle: spread.title,
    conclusion: buildConclusion(spreadId, keywords),
    flowSummary: pages.map((page) => `${page.positionLabel} · ${page.card.name_ko}`).join("  →  "),
    advice: readings[2]?.advice ?? getFallbackLine(cards[2], orientation),
    pages,
  };
};
