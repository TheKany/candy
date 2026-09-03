export const FIVE_CARD_POSITIONS = [
  { id: "situation", label: "상황", description: "지금 마주한 핵심 흐름" },
  { id: "cause", label: "원인", description: "이 흐름이 시작된 배경" },
  { id: "obstacle", label: "장애물", description: "앞을 막는 핵심 지점" },
  { id: "advice", label: "조언", description: "지금 취할 현실적인 행동" },
  { id: "outcome", label: "결과", description: "현재대로 갈 때의 가능성" },
] as const;

export const getFiveCardPosition = (index: number) =>
  FIVE_CARD_POSITIONS[index] ?? null;
