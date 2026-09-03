export type TarotTypeId = "one" | "three" | "five" | "celtic" | "horoscope";
export type AvailableTarotTypeId = "one" | "three" | "five";

export type TarotTypeOption = {
  id: TarotTypeId;
  title: string;
  subtitle: string;
  symbol: string;
  available: boolean;
};

export type TarotSelectionAction =
  | { kind: "navigate"; href: "/topic"; type: AvailableTarotTypeId }
  | { kind: "notice"; message: "준비 중이에요" };

export const TAROT_TYPES = [
  { id: "one", title: "원 오라클", subtitle: "한 장의 메시지", symbol: "☾", available: true },
  { id: "three", title: "쓰리카드", subtitle: "과거 · 현재 · 미래", symbol: "Ⅲ", available: true },
  { id: "five", title: "파이브카드", subtitle: "상황 · 원인 · 장애물 · 조언 · 결과", symbol: "Ⅴ", available: true },
] as const satisfies readonly TarotTypeOption[];

export function getTarotSelectionAction(
  id: TarotTypeId,
): TarotSelectionAction {
  if (id === "one" || id === "three" || id === "five") {
    return { kind: "navigate", href: "/topic", type: id };
  }

  return { kind: "notice", message: "준비 중이에요" };
}
