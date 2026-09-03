export type ThreeCardPosition = {
  id: string;
  label: string;
  description: string;
};

export const THREE_CARD_SPREADS = [
  {
    id: "timeline",
    title: "시간의 흐름",
    subtitle: "지나온 이유부터 앞으로의 방향까지",
    symbol: "↝",
    positions: [
      { id: "past", label: "과거", description: "지금까지 영향을 주는 배경" },
      { id: "present", label: "현재", description: "지금 마주한 핵심 흐름" },
      { id: "future", label: "미래", description: "현재대로 갈 때의 가능성" },
    ],
  },
  {
    id: "problem",
    title: "문제 해결",
    subtitle: "상황을 풀어낼 현실적인 실마리",
    symbol: "✦",
    positions: [
      { id: "situation", label: "상황", description: "문제의 현재 모습" },
      { id: "obstacle", label: "장애물", description: "흐름을 막는 핵심" },
      { id: "advice", label: "조언", description: "지금 취할 수 있는 행동" },
    ],
  },
  {
    id: "relationship",
    title: "관계의 흐름",
    subtitle: "나와 상대, 두 사람 사이의 온도",
    symbol: "♡",
    positions: [
      { id: "self", label: "나", description: "내 마음과 태도" },
      { id: "other", label: "상대", description: "상대에게 작동하는 흐름" },
      { id: "connection", label: "관계", description: "두 사람 사이의 방향" },
    ],
  },
  {
    id: "choice",
    title: "선택의 갈림길",
    subtitle: "두 선택과 결정의 기준",
    symbol: "◇",
    positions: [
      { id: "option-a", label: "선택 A", description: "첫 번째 길의 가능성" },
      { id: "option-b", label: "선택 B", description: "두 번째 길의 가능성" },
      { id: "decision-key", label: "결정의 열쇠", description: "놓치지 말아야 할 기준" },
    ],
  },
  {
    id: "direction",
    title: "답의 방향",
    subtitle: "NO와 보류, YES를 가르는 조건",
    symbol: "⚖",
    positions: [
      { id: "no", label: "NO", description: "지금 진행을 막는 신호" },
      { id: "hold", label: "보류", description: "더 확인해야 할 변수" },
      { id: "yes", label: "YES", description: "가능성을 여는 조건" },
    ],
  },
] as const;

export type ThreeCardSpreadId = (typeof THREE_CARD_SPREADS)[number]["id"];
export type ThreeCardSpread = (typeof THREE_CARD_SPREADS)[number];

export const getThreeCardSpread = (value: unknown): ThreeCardSpread | null =>
  THREE_CARD_SPREADS.find(({ id }) => id === value) ?? null;
