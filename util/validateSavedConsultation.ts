import type { ReadingExport } from "./readingExportLayout";
export class AccountRequestError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}
export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function assertSameOrigin(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) throw new AccountRequestError("요청 경로를 확인해주세요.", 403);
}
export async function readLimitedJson(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new AccountRequestError("요청 형식을 확인해주세요.", 415);
  const reader = request.body?.getReader();
  if (!reader) throw new AccountRequestError("저장할 내용이 없어요.");
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    size += value.byteLength;
    if (size > 1048576) { await reader.cancel(); throw new AccountRequestError("한 번에 저장할 수 있는 크기를 넘었어요.", 413); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); } catch { throw new AccountRequestError("저장할 내용을 확인해주세요."); }
}
const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown, max: number) => typeof value === "string" && value.length <= max;
const keys = (value: Record<string, unknown>, allowed: string[]) => Object.keys(value).every(key => allowed.includes(key));
export function parseSavedConsultation(value: unknown): { consultationId: string; revision: number; readings: ReadingExport[]; questionMode?: "original" | "keywords" } {
  if (!isObject(value) || !keys(value, ["consultationId", "revision", "readings", "questionMode"])
    || (value.questionMode !== undefined && value.questionMode !== "original" && value.questionMode !== "keywords")
    || typeof value.consultationId !== "string" || !uuidPattern.test(value.consultationId)
    || !Number.isInteger(value.revision) || Number(value.revision) < 1 || Number(value.revision) > 78
    || !Array.isArray(value.readings) || value.readings.length !== value.revision
    || !value.readings.every(reading => isObject(reading) && keys(reading, ["title", "question", "keywords", "sections"])
      && text(reading.title, 150) && (reading.question === undefined || text(reading.question, 1000))
      && (reading.keywords === undefined || (Array.isArray(reading.keywords) && reading.keywords.length <= 3 && reading.keywords.every(word => text(word, 30))))
      && Array.isArray(reading.sections) && reading.sections.length >= 1 && reading.sections.length <= 96
      && reading.sections.every(section => isObject(section) && keys(section, ["title", "text", "cardId"])
        && text(section.title, 200) && text(section.text, 20000)
        && (section.cardId === undefined || (Number.isInteger(section.cardId) && Number(section.cardId) >= 0 && Number(section.cardId) <= 77))))) throw new AccountRequestError("저장할 상담 내용을 확인해주세요.");
  return value as { consultationId: string; revision: number; readings: ReadingExport[]; questionMode?: "original" | "keywords" };
}
