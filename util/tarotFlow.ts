import type { TarotTopicId } from "@/constants/tarotTopics";
import { getThreeCardSpread, type ThreeCardSpreadId } from "../constants/threeCardSpreads.ts";
import type { TarotType } from "@/store/useTarotTypeStore";

export const getReadingFlowRedirect = (
  type: TarotType,
  topic: TarotTopicId | null,
  spread: ThreeCardSpreadId | null = null,
): "/select" | "/spread" | "/topic" | null => {
  if (!type) return "/select";
  if (type === "three" && !getThreeCardSpread(spread)) return "/spread";
  if (!topic) return "/topic";
  return null;
};
