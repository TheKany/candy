import type { MonthlyPeriod } from "../types/monthlyReadingTypes.ts";

export type MonthlyYearChoice = "current" | "next";

export function getMonthlyPeriod(now = new Date(), choice: MonthlyYearChoice = "current"): MonthlyPeriod {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", year: "numeric", month: "numeric" }).formatToParts(now);
  const year = Number(parts.find(part => part.type === "year")?.value) + (choice === "next" ? 1 : 0);
  const startMonth = choice === "next" ? 1 : Number(parts.find(part => part.type === "month")?.value);
  return { year, startMonth, months: Array.from({ length: 13 - startMonth }, (_, index) => startMonth + index) };
}
