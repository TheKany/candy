import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TarotType = "one" | "three" | "Yn" | null;

interface TarotStore {
  type: TarotType;
  setType: (type: TarotType) => void;
  resetType: () => void;
}

export const useTarotType = create<TarotStore>()(
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
