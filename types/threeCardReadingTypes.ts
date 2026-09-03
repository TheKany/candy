import type { ThreeCardSpreadId } from "@/constants/threeCardSpreads";
import type { TarotCardProfile } from "@/types/tarotReadingTypes";

export type ThreeCardReadingPage = {
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

export type ThreeCardReadingResult = {
  spread: ThreeCardSpreadId;
  spreadTitle: string;
  conclusion: string;
  flowSummary: string;
  advice: string;
  pages: ThreeCardReadingPage[];
};
