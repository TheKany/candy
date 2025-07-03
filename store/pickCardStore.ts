import { create } from "zustand";

interface PickCardWayStore {
  pickWay: 'top' | 'bot' |  null;
  setPickWay: (card: 'top' | 'bot') => void;
  resetWay: () => void;
}

export const usePickCard = create<PickCardWayStore>((set) => ({
  pickWay: null,
  setPickWay: (pickWay) => set({ pickWay }),
  resetWay: () => set({ pickWay: null}),
}));
