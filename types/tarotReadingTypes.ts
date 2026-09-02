import type { TarotTopicId } from "@/constants/tarotTopics";

export type TarotOrientation = "upright" | "reversed";

export type TarotCardProfile = {
  card_id: number;
  name_ko: string;
  name_en: string;
  arcana: "major" | "minor";
  suit: "wands" | "cups" | "swords" | "pentacles" | null;
  rank: string;
  upright_keywords: string[];
  reversed_keywords: string[];
  upright_one_line: string;
  reversed_one_line: string;
};

export type TarotTopicReading = {
  card_id: number;
  topic_id: TarotTopicId;
  orientation: TarotOrientation;
  headline: string;
  core_message: string;
  emotional_layer: string;
  hidden_context: string;
  challenge: string;
  opportunity: string;
  near_future: string;
  advice: string;
  reflection_question: string;
};

export type TarotReadingResult = {
  card: TarotCardProfile;
  reading: TarotTopicReading | null;
  fallback: boolean;
};
