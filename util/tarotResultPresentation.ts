import type { TarotTopicReading } from "../types/tarotReadingTypes.ts";

export const buildTarotResultPresentation = (reading: TarotTopicReading) => ({
  conclusion: reading.conclusion,
  headline: reading.headline,
  details: [
    ["지금의 전체 흐름", reading.core_message],
    ["감정의 층위", reading.emotional_layer],
    ["숨은 맥락", reading.hidden_context],
    ["마주할 과제", reading.challenge],
    ["열려 있는 기회", reading.opportunity],
    ["가까운 흐름", reading.near_future],
  ] as const,
  advice: reading.advice,
  reflectionQuestion: reading.reflection_question,
});
