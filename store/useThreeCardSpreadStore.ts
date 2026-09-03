import type { ThreeCardSpreadId } from "@/constants/threeCardSpreads";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThreeCardSpreadStore = {
  spread: ThreeCardSpreadId | null;
  setSpread: (spread: ThreeCardSpreadId) => void;
  resetSpread: () => void;
};

export const useThreeCardSpreadStore = create<ThreeCardSpreadStore>()(
  persist(
    (set) => ({
      spread: null,
      setSpread: (spread) => set({ spread }),
      resetSpread: () => set({ spread: null }),
    }),
    { name: "three-card-spread" },
  ),
);
