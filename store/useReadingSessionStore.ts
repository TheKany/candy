import { create } from "zustand";
import type { ReadingExport } from "../util/readingExportLayout";

export type PreviousConsultation = { originalQuestion: string; summary: string };

// Only kept in memory for this consultation; no DB or localStorage history.
type ReadingSession = {
  consultationId: string;
  accountSavedRevision: number;
  markAccountSaved: (revision: number) => void;
  history: { id: string; data: ReadingExport }[];
  downloadedCount: number;
  remember: (entry: { id: string; data: ReadingExport }) => void;
  markDownloaded: (count: number) => void;
  deck: number[];
  usedPositions: number[];
  previousConsultation: PreviousConsultation | null;
  start: (deck: number[]) => void;
  pick: (position: number) => boolean;
  continueWith: (context: PreviousConsultation) => boolean;
  reset: () => void;
};

export const useReadingSessionStore = create<ReadingSession>((set, get) => ({
  consultationId: "", accountSavedRevision: 0,
  markAccountSaved: (revision) => set(state => ({ accountSavedRevision: Math.max(state.accountSavedRevision, Math.min(revision, state.history.length)) })),
  history: [], downloadedCount: 0,
  remember: (entry) => set(state => state.history.some(item => item.id === entry.id) ? state : { history: [...state.history, entry] }),
  markDownloaded: (count) => set(state => ({ downloadedCount: Math.max(state.downloadedCount, Math.min(count, state.history.length)) })),
  deck: [], usedPositions: [], previousConsultation: null,
  start: (deck) => set({ deck: [...deck], usedPositions: [], previousConsultation: null, history: [], downloadedCount: 0, consultationId: crypto.randomUUID(), accountSavedRevision: 0 }),
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
  reset: () => set({ deck: [], usedPositions: [], previousConsultation: null, history: [], downloadedCount: 0, consultationId: "", accountSavedRevision: 0 }),
}));
