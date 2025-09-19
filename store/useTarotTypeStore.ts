import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TarotType = "one" | "three" | null;

interface TarotStore {
  type: TarotType;
  setType: (type: TarotType) => void;
  resetType: () => void;
}

export const useTarotTypeStore = create<TarotStore>()(
  persist(
    (set) => ({
      type: null,
      setType: (type) => set({ type }),
      resetType: () => set({ type: null }),
    }),
    {
      name: "tarot-type",
    }
  )
);
