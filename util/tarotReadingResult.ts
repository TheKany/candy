import type {
  TarotCardProfile,
  TarotPositionReading,
  TarotReadingResult,
} from "../types/tarotReadingTypes.ts";

export const buildTarotReadingResult = (
  card: TarotCardProfile,
  reading: TarotPositionReading | null,
): TarotReadingResult => ({
  card,
  reading,
  fallback: reading === null,
});
