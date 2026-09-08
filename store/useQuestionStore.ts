import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { QuestionAnalysis } from "@/util/analyzeQuestion";

type QuestionStore = {
  question: string;
  analysis: QuestionAnalysis | null;
  save: (question: string, analysis: QuestionAnalysis | null) => void;
  reset: () => void;
};

export const useQuestionStore = create<QuestionStore>()(persist((set) => ({
  question: "",
  analysis: null,
  save: (question, analysis) => set({ question, analysis }),
  reset: () => set({ question: "", analysis: null }),
}), {
  name: "tarot-question",
  storage: createJSONStorage(() => sessionStorage),
}));
