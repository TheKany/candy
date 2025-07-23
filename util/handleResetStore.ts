import { usePickCardStoreSlotStore } from "@/store/pickCardSlotStore";
import { usePickCardStore } from "@/store/pickCardStore";
import { useShuffleTypeStore } from "@/store/useShuffleTypeStore";
import { useTarotTypeStore } from "@/store/tarotTypeStore";

export const handleResetStore = () => {
  usePickCardStore.getState().resetPickKeyword();
  usePickCardStoreSlotStore.getState().resetSlotPositions();
  useShuffleTypeStore.getState().resetShuffleStep();
  useTarotTypeStore.getState().resetType();
};
