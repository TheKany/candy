import { usePickCardSlotStore } from "@/store/pickCardSlotStore";
import { usePickCard } from "@/store/pickCardStore";
import { useShuffleType } from "@/store/shuffleTypeStore";
import { useTarotType } from "@/store/tarotTypeStore";

export const handleResetStore = () => {
  usePickCard.getState().resetPickKeyword();
  usePickCardSlotStore.getState().resetSlotPositions();
  useShuffleType.getState().resetShuffleStep();
  useTarotType.getState().resetType();
};
