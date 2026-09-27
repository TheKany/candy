export type ExportSection = { title: string; text: string; cardId?: number };
export type ReadingExport = { title: string; question?: string; keywords?: string[]; sections: ExportSection[]; readings?: ReadingExport[] };

export function readingExportSections(data: ReadingExport, include: boolean): ExportSection[] {
  if (data.readings) return data.readings.flatMap((reading, index) => [
    { title: index === 0 ? "처음 질문" : `연계 질문 ${index}`, text: include && reading.question?.trim() ? reading.question : reading.keywords?.join(" · ") || "타로 상담" },
    ...reading.sections,
  ]);
  if (data.question && !include && data.keywords?.length) return [{ title: "질문 키워드", text: data.keywords.join(" · ") }, ...data.sections];
  return exportSections(data.sections, data.question, include);
}

export function exportSections(sections: ExportSection[], question: string | undefined, include: boolean): ExportSection[] {
  return include && question?.trim() ? [{ title: "내 질문", text: question }, ...sections] : sections;
}

export function wrapExportText(text: string, width: number, measure: (text: string) => number): string[] {
  return text.replace(/\r/g, "").split("\n").flatMap(paragraph => {
    const lines: string[] = []; let line = "";
    for (const char of Array.from(paragraph)) {
      if (line && measure(line + char) > width) { lines.push(line); line = ""; }
      line += char;
    }
    lines.push(line); return lines;
  });
}
