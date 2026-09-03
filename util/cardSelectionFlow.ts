import { getThreeCardSpread, type ThreeCardSpreadId } from "../constants/threeCardSpreads.ts";

export const SHUFFLE_GUIDANCE = {
  shuffling: "카드를 섞는 동안 질문을 생각해주세요.",
  ready: "카드를 뽑아볼까요?",
  warning: "운명은 한번 결정하면 되돌릴 수 없습니다",
} as const;

export const getNextPositionLabel = (
  type: string | null,
  spread: ThreeCardSpreadId | null,
  pickedCount: number,
): string | null => {
  if (type !== "three") return pickedCount === 0 ? "선택한 카드" : null;
  return getThreeCardSpread(spread)?.positions[pickedCount]?.label ?? null;
};

export const getCardAtPosition = (
  deck: number[],
  position: number
): number | null => {
  if (!Number.isInteger(position) || position < 1 || position > deck.length) {
    return null;
  }

  return deck[position - 1] ?? null;
};

export const shouldOpenResultAfterReveal = (
  type: string | null,
  pickedCount: number,
  revealComplete: boolean
) => {
  if (!revealComplete) return false;
  if (type === "one" || type === "Yn") return pickedCount === 1;
  if (type === "three") return pickedCount === 3;
  return false;
};

type Point = { top: number; left: number };
type ScrollOffset = { x: number; y: number };

export const getRelativeSlotPosition = (
  slotDocumentPosition: Point,
  containerViewportPosition: Point,
  scrollOffset: ScrollOffset
): Point => ({
  top:
    slotDocumentPosition.top -
    (containerViewportPosition.top + scrollOffset.y),
  left:
    slotDocumentPosition.left -
    (containerViewportPosition.left + scrollOffset.x),
});
