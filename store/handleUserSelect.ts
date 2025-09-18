// 유저가 고른 고민의 종류

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type UserAnswers = {
  emotion: string | null;
  relationship: string | null;
  stage: string | null;
  cause: string | null;
  change: string | null;
};

type UserSelectAnswerStore = UserAnswers & {
  setEmotion: (value: string) => void;
  setRelationship: (value: string) => void;
  setStage: (value: string) => void;
  setCause: (value: string) => void;
  setChange: (value: string) => void;
};

export const useUserSelectAnswer = create<UserSelectAnswerStore>()(
  persist(
    (set) => ({
      emotion: null,
      relationship: null,
      stage: null,
      cause: null,
      change: null,
      setEmotion: (value) => set({ emotion: value }),
      setRelationship: (value) => set({ relationship: value }),
      setStage: (value) => set({ stage: value }),
      setCause: (value) => set({ cause: value }),
      setChange: (value) => set({ change: value }),
    }),
    {
      name: "userPick",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
