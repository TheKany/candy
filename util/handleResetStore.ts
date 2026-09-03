import { usePickCardStoreSlotStore } from "@/store/usepickCardSlotStore";
import { useShuffleTypeStore } from "@/store/useShuffleTypeStore";
import { useTarotTopicStore } from "@/store/useTarotTopicStore";
import { useTarotTypeStore } from "@/store/useTarotTypeStore";
import { useUserPickNum } from "@/store/useUserPickNumStore";
import { useUserSelectAnswer } from "@/store/useUserSelectAnswerStore";
import { useThreeCardSpreadStore } from "@/store/useThreeCardSpreadStore";

export const handleResetCardProgress = () => {
  usePickCardStoreSlotStore.getState().resetSlotPositions();
  useShuffleTypeStore.getState().resetShuffleStep();
  useUserPickNum.getState().reset();
};

export const handleResetStore = () => {
  handleResetCardProgress();
  useTarotTypeStore.getState().resetType();
  useTarotTopicStore.getState().resetTopic();
  useThreeCardSpreadStore.getState().resetSpread();
  useUserSelectAnswer.getState().resetAnswer();
};
