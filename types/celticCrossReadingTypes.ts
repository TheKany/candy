import type {
  TarotCardProfile,
  TarotOrientation,
} from "@/types/tarotReadingTypes";

export type CelticCrossReadingPage = {
  positionId: string;
  positionLabel: string;
  positionDescription: string;
  card: TarotCardProfile;
  orientation: TarotOrientation;
  headline: string;
  summary: string;
  detail: string;
  reflectionQuestion: string;
  fallback: boolean;
};

export type CelticCrossReadingResult = {
  conclusion: string;
  coreConflict: string;
  innerGap: string;
  timeline: string;
  outerInfluence: string;
  advice: string;
  pages: CelticCrossReadingPage[];
};
