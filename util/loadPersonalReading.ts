import { useQuestionStore } from "@/store/useQuestionStore";

export async function loadPersonalReading(mode: "one" | "three" | "five", cardIds: string[], signal: AbortSignal) {
  const { question } = useQuestionStore.getState();
  if (!question.trim()) {
    throw new Error("먼저 질문을 입력해주세요.");
  }
  const response = await fetch("/api/personalReading", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, cardIds: cardIds.map(Number), question }), signal,
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "해설을 불러오지 못했어요. 다시 시도해주세요.");
  return body;
}
