import type { TarotPositionReading } from "../types/tarotReadingTypes.ts";

export const buildTarotResultPresentation = (reading: TarotPositionReading) => ({
  conclusion: reading.summary,
  headline: reading.headline,
  details: [
    ["카드가 들려주는 이야기", reading.detail],
  ] as const,
  advice: reading.advice,
  reflectionQuestion: reading.reflection_question,
});
