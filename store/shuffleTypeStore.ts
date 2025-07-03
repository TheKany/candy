import { create } from "zustand";

export type TarotType = 1 | 2 | 3 | 4 | null;

interface ShuffleType {
  shuffleStep: TarotType;
  setShuffleStep: (type: TarotType) => void;
  resetShuffleStep: () => void;
}

export const useShuffleType = create<ShuffleType>((set) => ({
  shuffleStep: null,
  setShuffleStep: (shuffleStep) => set({ shuffleStep }),
  resetShuffleStep: () => set({ shuffleStep: null }),
}));
