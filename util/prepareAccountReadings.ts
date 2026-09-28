import type { ReadingExport } from "./readingExportLayout";

export type QuestionSaveMode = "original" | "keywords";

export function prepareAccountReadings(readings: ReadingExport[], mode: QuestionSaveMode): ReadingExport[] {
  return readings.map(reading => mode === "original" ? { ...reading } : {
    title: reading.title,
    keywords: reading.keywords?.length ? [...reading.keywords] : ["타로 상담"],
    sections: reading.sections,
  });
}
