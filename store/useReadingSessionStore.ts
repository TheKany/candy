import { create } from "zustand";

export type PreviousConsultation = { originalQuestion: string; summary: string };

// Only kept in memory for this consultation; no DB or localStorage history.
type ReadingSession = {
  deck: number[];
  usedPositions: number[];
  previousConsultation: PreviousConsultation | null;
  start: (deck: number[]) => void;
  pick: (position: number) => boolean;
  continueWith: (context: PreviousConsultation) => boolean;
  reset: () => void;
};

export const useReadingSessionStore = create<ReadingSession>((set, get) => ({
  deck: [], usedPositions: [], previousConsultation: null,
  start: (deck) => set({ deck: [...deck], usedPositions: [], previousConsultation: null }),
  pick: (position) => {
    const state = get();
    if (!Number.isInteger(position) || position < 1 || position > state.deck.length || state.usedPositions.includes(position)) return false;
    set({ usedPositions: [...state.usedPositions, position] });
    return true;
  },
  continueWith: (previousConsultation) => {
    const state = get();
    if (!state.deck.length || state.usedPositions.length >= state.deck.length) return false;
    set({ previousConsultation });
    return true;
  },
  reset: () => set({ deck: [], usedPositions: [], previousConsultation: null }),
}));
