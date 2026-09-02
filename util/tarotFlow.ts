import type { TarotTopicId } from "@/constants/tarotTopics";
import type { TarotType } from "@/store/useTarotTypeStore";

export const getReadingFlowRedirect = (
  type: TarotType,
  topic: TarotTopicId | null,
): "/select" | "/topic" | null => {
  if (!type) return "/select";
  if (!topic) return "/topic";
  return null;
};
