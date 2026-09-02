export type TarotTopicId =
  | "their-feelings"
  | "new-love"
  | "relationship-flow"
  | "career"
  | "money"
  | "relationships"
  | "decision"
  | "personal-flow";

export type TarotTopicOption = {
  id: TarotTopicId;
  title: string;
  symbol: string;
};

export const TAROT_TOPICS = [
  { id: "their-feelings", title: "상대의 마음", symbol: "♡" },
  { id: "new-love", title: "새로운 인연", symbol: "✧" },
  { id: "relationship-flow", title: "관계의 흐름", symbol: "∞" },
  { id: "career", title: "일·커리어", symbol: "♜" },
  { id: "money", title: "금전운", symbol: "◇" },
  { id: "relationships", title: "인간관계", symbol: "☊" },
  { id: "decision", title: "선택·결정", symbol: "⇄" },
  { id: "personal-flow", title: "나의 흐름", symbol: "☾" },
] as const satisfies readonly TarotTopicOption[];

export const isTarotTopicId = (value: unknown): value is TarotTopicId =>
  TAROT_TOPICS.some(({ id }) => id === value);

export const getTarotTopic = (id: unknown): TarotTopicOption | null =>
  isTarotTopicId(id)
    ? TAROT_TOPICS.find((topic) => topic.id === id) ?? null
    : null;

export const getTopicSelectionAction = (id: TarotTopicId | null) =>
  id
    ? ({ kind: "navigate", href: "/shuffle" } as const)
    : ({ kind: "hidden" } as const);
