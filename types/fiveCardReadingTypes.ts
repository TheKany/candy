import type { TarotCardProfile } from "@/types/tarotReadingTypes";

export type FiveCardReadingPage = {
  positionId: string;
  positionLabel: string;
  positionDescription: string;
  card: TarotCardProfile;
  headline: string;
  summary: string;
  detail: string;
  reflectionQuestion: string;
  fallback: boolean;
};

export type FiveCardReadingResult = {
  spreadTitle: string;
  conclusion: string;
  flowSummary: string;
  advice: string;
  pages: FiveCardReadingPage[];
};
