import { useQuestionStore } from "@/store/useQuestionStore";
import { useReadingSessionStore } from "@/store/useReadingSessionStore";
import { requestPersonalReading } from "./readingTransport";

export async function loadPersonalReading(mode: "one" | "three" | "five", cardIds: string[], signal: AbortSignal, onRetry?: () => void) {
  const { question } = useQuestionStore.getState();
  if (!question.trim()) {
    throw new Error("먼저 질문을 입력해주세요.");
  }
  return requestPersonalReading({ mode, cardIds: cardIds.map(Number), question, previousConsultation: useReadingSessionStore.getState().previousConsultation }, signal, onRetry);
}
