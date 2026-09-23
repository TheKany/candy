export type TarotTypeId = "one" | "three" | "five" | "celtic" | "horoscope" | "monthly";
export type AvailableTarotTypeId = "one" | "three" | "five" | "monthly";

export type TarotTypeOption = {
  id: TarotTypeId;
  title: string;
  subtitle: string;
  symbol: string;
  available: boolean;
};

export type TarotSelectionAction =
  | { kind: "navigate"; href: "/topic" | "/shuffle"; type: AvailableTarotTypeId }
  | { kind: "notice"; message: "준비 중이에요" };

export const TAROT_TYPES = [
  { id: "one", title: "원 오라클", subtitle: "한 장의 메시지", symbol: "☾", available: true },
  { id: "three", title: "쓰리카드", subtitle: "현재 상황 · 핵심 요인 · 조언과 방향", symbol: "Ⅲ", available: true },
  { id: "five", title: "파이브카드", subtitle: "상황 · 원인 · 장애물 · 조언 · 결과", symbol: "Ⅴ", available: true },
  { id: "monthly", title: "월별 타로", subtitle: "이번 달부터 연말까지의 흐름", symbol: "♧", available: true },
] as const satisfies readonly TarotTypeOption[];

export function getTarotSelectionAction(
  id: TarotTypeId,
): TarotSelectionAction {
  if (id === "monthly") return { kind: "navigate", href: "/shuffle", type: id };
  if (id === "one" || id === "three" || id === "five") {
    return { kind: "navigate", href: "/topic", type: id };
  }

  return { kind: "notice", message: "준비 중이에요" };
}
