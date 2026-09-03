import type { TarotOrientation } from "@/types/tarotReadingTypes";
import { create } from "zustand";

type CardOrientationState = {
  orientations: TarotOrientation[];
  addOrientation: (orientation: TarotOrientation) => void;
  resetOrientations: () => void;
};

export const useCardOrientationStore = create<CardOrientationState>((set) => ({
  orientations: [],
  addOrientation: (orientation) =>
    set((state) => ({ orientations: [...state.orientations, orientation] })),
  resetOrientations: () => set({ orientations: [] }),
}));
