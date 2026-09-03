import type { TarotTopicId } from "@/constants/tarotTopics";
import type { ThreeCardSpreadId } from "../constants/threeCardSpreads.ts";
import type { TarotType } from "@/store/useTarotTypeStore";

export const getReadingFlowRedirect = (
  type: TarotType,
  topic: TarotTopicId | null,
  _spread: ThreeCardSpreadId | null = null,
): "/select" | "/spread" | "/topic" | null => {
  if (!type) return "/select";
  if (!topic) return "/topic";
  return null;
};
