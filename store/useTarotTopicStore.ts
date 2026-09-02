import {
  isTarotTopicId,
  type TarotTopicId,
} from "@/constants/tarotTopics";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type TarotTopicStore = {
  topic: TarotTopicId | null;
  setTopic: (topic: TarotTopicId) => void;
  resetTopic: () => void;
};

export const useTarotTopicStore = create<TarotTopicStore>()(
  persist(
    (set) => ({
      topic: null,
      setTopic: (topic) => set({ topic }),
      resetTopic: () => set({ topic: null }),
    }),
    {
      name: "tarot-topic",
      storage: createJSONStorage(() => sessionStorage),
      merge: (persisted, current) => {
        const saved = persisted as Partial<TarotTopicStore> | undefined;

        return {
          ...current,
          topic: isTarotTopicId(saved?.topic) ? saved.topic : null,
        };
      },
    },
  ),
);
