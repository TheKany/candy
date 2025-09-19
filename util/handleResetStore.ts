import { usePickCardStoreSlotStore } from "@/store/usepickCardSlotStore";
import { useShuffleTypeStore } from "@/store/useShuffleTypeStore";
import { useTarotTypeStore } from "@/store/useTarotTypeStore";
import { useUserPickNum } from "@/store/useUserPickNumStore";
import { useUserSelectAnswer } from "@/store/useUserSelectAnswerStore";

export const handleResetStore = () => {
  usePickCardStoreSlotStore.getState().resetSlotPositions();
  useShuffleTypeStore.getState().resetShuffleStep();
  useTarotTypeStore.getState().resetType();
  useUserSelectAnswer.getState().resetAnswer();
  useUserPickNum.getState().reset();
};
