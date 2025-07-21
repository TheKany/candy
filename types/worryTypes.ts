// 고민 키워드
export const worryKeywordList = [
  "career",
  "finance",
  "love",
  "path",
  "relationship",
  "self",
  "",
] as const;
export type WorryKeyword = (typeof worryKeywordList)[number];
export const worryDisplayKor: Record<
  (typeof worryKeywordList)[number],
  string
> = {
  career: "💼 직장 · 일 · 커리어",
  finance: "💰 돈 · 재정 · 소비",
  love: "❤️ 연애 · 썸 · 사랑",
  path: "🤝 친구 · 가족 · 소통",
  relationship: "📚 학업 · 진로 · 시험",
  self: "🧘‍♀️ 감정 · 자존감 · 나 자신",
  "": "",
};

// 감정 키워드
export const emotionKeywordList = [
  "anxious",
  "stuck",
  "exhausted",
  "confused",
  "regretful",
  "sad",
  "excited",
  "",
] as const;
export type EmotionKeyword = (typeof emotionKeywordList)[number];
export const emotionDisplayKor: Record<EmotionKeyword, string> = {
  anxious: "😰 불안하다",
  stuck: "😵 답답하다",
  exhausted: "😩 지쳤다",
  confused: "❓ 잘 모르겠다",
  regretful: "😔 후회된다",
  sad: "😢 슬프다",
  excited: "💓 설렌다",
  "": "",
};

// 흐름 키워드
export const flowKeywordList = [
  "beginning",
  "ongoing",
  "ending",
  "stuck",
  "change",
  "unclear",
  "",
] as const;
export type FlowKeyword = (typeof flowKeywordList)[number];
export const flowDisplayKor: Record<FlowKeyword, string> = {
  beginning: "🌱 시작하려는 중",
  ongoing: "🔄 진행 중이다",
  ending: "🌇 마무리 중이다",
  stuck: "⛔ 멈춰 있다",
  change: "🔀 변화가 생겼다",
  unclear: "🌫️ 알 수 없다",
  "": "",
};
