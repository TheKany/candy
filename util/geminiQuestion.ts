import { generateGeminiJSON } from "./geminiReading.ts";
import { QUESTION_SCHEMA, QUESTION_SYSTEM_PROMPT, parseQuestionModelOutput } from "./questionModel.ts";

export async function analyzeGeminiQuestion(question: string, signal: AbortSignal) {
  const result = await generateGeminiJSON(QUESTION_SYSTEM_PROMPT, question, QUESTION_SCHEMA, signal, 2048);
  return parseQuestionModelOutput(result, question);
}
