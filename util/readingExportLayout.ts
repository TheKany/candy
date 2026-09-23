export type ExportSection = { title: string; text: string; cardId?: number };
export type ReadingExport = { title: string; question?: string; sections: ExportSection[] };

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
