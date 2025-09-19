import { create } from "zustand";

type PickNumProps = {
  inputs: string[];
  realCard: string[];
  setInput: (input: string) => void;
  setRealCard: (realCard: string) => void;
  reset: () => void;
};

export const useUserPickNum = create<PickNumProps>((set) => ({
  inputs: [],
  realCard: [],
  setInput: (input: string) =>
    set((state) => ({ inputs: [...state.inputs, input] })),
  setRealCard: (card: string) =>
    set((state) => ({ realCard: [...state.realCard, card] })),
  reset: () => set({ inputs: [], realCard: [] }),
}));
