export const ACTIVITY_TOPICS = ["일·커리어", "금전", "연애", "인간관계", "나 자신", "월별 흐름", "타로 상담"] as const;
export function safeActivityTopic(keywords: string[] = []): string {
  const words = keywords.join(" ");
  if (/월별/.test(words)) return "월별 흐름";
  if (/직장|회사|취업|학업|시험|커리어|승진|이직/.test(words)) return "일·커리어";
  if (/금전|돈|재정|투자/.test(words)) return "금전";
  if (/연애|사랑|재회|결혼/.test(words)) return "연애";
  if (/관계|친구|가족|동료/.test(words)) return "인간관계";
  if (/자신|휴식|마음|성장/.test(words)) return "나 자신";
  return "타로 상담";
}
export function isRepresentativeCard(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 78);
}
export function rewardDisplay(ads: number, premium: number, basic: number) {
  const stamps = Math.min(3, Math.max(0, ads));
  return { stamps, completed: stamps === 3, premium, basic, basicUsable: basic > 0 };
}
