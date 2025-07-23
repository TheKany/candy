import { EmotionKeyword, FlowKeyword, WorryKeyword } from "@/types/worryTypes";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface PickCardWayStore {
  pickedWorry: WorryKeyword | null;
  pickedEmotion: EmotionKeyword | null;
  pickedFlow: FlowKeyword | null;
  pickedCardList: number[];
  setPickedWorry: (worry: WorryKeyword) => void;
  setPickedEmotion: (emotion: EmotionKeyword) => void;
  setPickedFlow: (flow: FlowKeyword) => void;
  setPickedCardList: (pickedCardList: number[]) => void;
  resetPickKeyword: () => void;
}

export const usePickCardStore = create<PickCardWayStore>()(
  persist(
    (set) => ({
      pickedWorry: null,
      pickedEmotion: null,
      pickedFlow: null,
      pickedCardList: [],
      setPickedWorry: (worry) => set({ pickedWorry: worry }),
      setPickedEmotion: (emotion) => set({ pickedEmotion: emotion }),
      setPickedFlow: (flow) => set({ pickedFlow: flow }),
      setPickedCardList: (pickedCardList) => set({ pickedCardList }),
      resetPickKeyword: () =>
        set({
          pickedWorry: null,
          pickedEmotion: null,
          pickedFlow: null,
          pickedCardList: [],
        }),
    }),

    {
      name: "pickCard-data",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
