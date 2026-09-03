export type TarotTypeId = "one" | "three" | "celtic" | "horoscope";

export type TarotTypeOption = {
  id: TarotTypeId;
  title: string;
  subtitle: string;
  symbol: string;
  available: boolean;
};

export type TarotSelectionAction =
  | { kind: "navigate"; href: "/topic" | "/spread" }
  | { kind: "notice"; message: "준비 중이에요" };

export const TAROT_TYPES = [
  { id: "one", title: "원 오라클", subtitle: "힌트 찾기", symbol: "☾", available: true },
  { id: "three", title: "쓰리카드", subtitle: "직관적인 답", symbol: "Ⅲ", available: true },
  { id: "celtic", title: "켈틱 크로스", subtitle: "마음 들여다보기", symbol: "✦", available: true },
  { id: "horoscope", title: "호로스코프", subtitle: "내 전체 흐름", symbol: "☼", available: false },
] as const satisfies readonly TarotTypeOption[];

export function getTarotSelectionAction(
  id: TarotTypeId,
): TarotSelectionAction {
  if (id === "one" || id === "celtic") {
    return { kind: "navigate", href: "/topic" };
  }

  if (id === "three") {
    return { kind: "navigate", href: "/spread" };
  }

  return { kind: "notice", message: "준비 중이에요" };
}
