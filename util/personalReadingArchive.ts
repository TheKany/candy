import type { TarotReadingResult } from "../types/tarotReadingTypes";
import type { ThreeCardReadingResult } from "../types/threeCardReadingTypes";
import type { ReadingExport } from "./readingExportLayout";

export type PersonalReadingResponse = (TarotReadingResult | ThreeCardReadingResult) & {
  followUpQuestions: string[]; contextSummary: string; questionKeywords?: string[];
};

export function archivePersonalReading(result: PersonalReadingResponse, question: string): ReadingExport {
  const single = "reading" in result ? result : null;
  const multi = "pages" in result ? result : null;
  const pages = multi?.pages ?? (single?.reading ? [{ card: single.card, positionLabel: "한 장의 메시지", headline: single.reading.headline, summary: "", detail: single.reading.detail, remember: single.reading.remember, avoid: single.reading.avoid }] : []);
  return {
    title: "오늘의 이야기", question, keywords: result.questionKeywords?.length ? result.questionKeywords : ["타로 상담"],
    sections: [
      ...pages.map(page => ({ title: `뽑은 카드 · ${page.card.name_ko}`, cardId: page.card.card_id, text: page.card.upright_one_line || page.card.upright_keywords.join(" · ") })),
      { title: "종합 해설", text: [single?.reading?.summary ?? multi?.conclusion ?? "", ...(multi?.overview ?? [])].filter(Boolean).join("\n\n") },
      ...pages.flatMap(page => [
        { title: `${page.positionLabel} · ${page.card.name_ko}`, cardId: page.card.card_id, text: [page.headline, page.summary, page.detail].filter(Boolean).join("\n\n") },
        ...(page.remember ? [{title:`기억할 것 · ${page.card.name_ko}`,text:page.remember}] : []),
        ...(page.avoid ? [{title:`주의할 것 · ${page.card.name_ko}`,text:page.avoid}] : []),
      ]),
      { title: "지금 해볼 수 있는 일", text: single?.reading?.advice ?? multi?.advice ?? "" },
    ],
  };
}
