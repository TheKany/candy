import type { TarotCardProfile } from "./tarotReadingTypes";

export type MonthlyPeriod = { year: number; startMonth: number; months: number[] };
export type MonthlyPage = {
  month: number; cardId: number; nickname: string; message: string;
  money: string; work: string; relationships: string; wellbeing: string;
  luck: number; luckMessage: string;
};
export type MonthlyReadingResult = { year: number; pages: MonthlyPage[]; cards: TarotCardProfile[] };
export type MonthlyRequest = { year: number; startMonth: number; cardIds: number[] };
