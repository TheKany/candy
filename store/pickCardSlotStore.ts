import { create } from "zustand";

interface SlotPosition {
  top: number;
  left: number;
}

interface PickCardSlotStore {
  slotPositions: SlotPosition[];
  setSlotPosition: (index: number, position: SlotPosition) => void;
  resetSlotPositions: () => void;
}

export const usePickCardSlotStore = create<PickCardSlotStore>((set) => ({
  slotPositions: [],
  setSlotPosition: (index, position) =>
    set((state) => {
      const updated = [...state.slotPositions];
      updated[index] = position;
      return { slotPositions: updated };
    }),
  resetSlotPositions: () => set({ slotPositions: [] }),
}));
