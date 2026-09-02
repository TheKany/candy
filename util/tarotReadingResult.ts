import type {
  TarotCardProfile,
  TarotReadingResult,
  TarotTopicReading,
} from "../types/tarotReadingTypes.ts";

export const buildTarotReadingResult = (
  card: TarotCardProfile,
  reading: TarotTopicReading | null,
): TarotReadingResult => ({
  card,
  reading,
  fallback: reading === null,
});
