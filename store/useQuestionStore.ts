import { create } from "zustand";
import type { QuestionAnalysis } from "@/util/analyzeQuestion";

type QuestionStore = {
  question: string;
  analysis: QuestionAnalysis | null;
  consentQuestion: string;
  consent: (question: string) => void;
  save: (question: string, analysis: QuestionAnalysis | null) => void;
  reset: () => void;
};

// Questions are temporary consultation state, never browser-persisted history.
export const useQuestionStore = create<QuestionStore>((set) => ({
  question: "",
  analysis: null,
  consentQuestion: "",
  consent: (question) => set({ consentQuestion: question }),
  save: (question, analysis) => set((state) => ({ question, analysis, consentQuestion: state.consentQuestion === question ? question : "" })),
  reset: () => set({ question: "", analysis: null, consentQuestion: "" }),
}));
