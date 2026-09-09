import { useQuestionStore } from "@/store/useQuestionStore";

export async function loadPersonalReading(mode: "one" | "three" | "five", cardIds: string[], signal: AbortSignal) {
  const { question, consentQuestion } = useQuestionStore.getState();
  if (!question.trim() || consentQuestion !== question) {
    throw new Error("질문을 입력하고 전송 안내를 확인해주세요.");
  }
  const response = await fetch("/api/personalReading", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, cardIds: cardIds.map(Number), question, externalProcessingConfirmed: true }), signal,
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "해설을 불러오지 못했어요. 다시 시도해주세요.");
  return body;
}
