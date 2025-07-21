import { create } from "zustand";

/**
 * @type 1 = '시계 방향 회전'
 * @type 2 = '반시계 방향 회전'
 * @type 3 = '가운데 모으기'
 */
export type ShuffleStepType = 1 | 2 | 3 | 4 | null;

interface ShuffleType {
  shuffleStep: ShuffleStepType;
  setShuffleStep: (type: ShuffleStepType) => void;
  resetShuffleStep: () => void;
}

export const useShuffleType = create<ShuffleType>((set) => ({
  shuffleStep: null,
  setShuffleStep: (shuffleStep) => set({ shuffleStep }),
  resetShuffleStep: () => set({ shuffleStep: null }),
}));
