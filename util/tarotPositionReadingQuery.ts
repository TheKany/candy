import type { TarotOrientation } from "../types/tarotReadingTypes.ts";

export type PositionReadingTuple = Readonly<{
  cardId: number;
  positionId: string;
  orientation: TarotOrientation;
}>;

const POSITION_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const buildPositionReadingTupleFilter = (
  tuples: readonly PositionReadingTuple[],
): string => {
  if (tuples.length === 0) {
    throw new Error("At least one position tuple is required.");
  }

  return tuples.map(({ cardId, positionId, orientation }) => {
    const isValidCardId = Number.isInteger(cardId) && cardId >= 0 && cardId <= 77;
    const isValidPositionId = POSITION_ID_PATTERN.test(positionId);
    const isValidOrientation = orientation === "upright" || orientation === "reversed";

    if (!isValidCardId || !isValidPositionId || !isValidOrientation) {
      throw new Error("Invalid position tuple.");
    }

    return `and(card_id.eq.${cardId},position_id.eq.${positionId},orientation.eq.${orientation})`;
  }).join(",");
};
