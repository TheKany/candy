import type { MonthlyPeriod } from "../types/monthlyReadingTypes.ts";

export function getMonthlyPeriod(now = new Date()): MonthlyPeriod {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", year: "numeric", month: "numeric" }).formatToParts(now);
  const year = Number(parts.find(part => part.type === "year")?.value);
  const startMonth = Number(parts.find(part => part.type === "month")?.value);
  return { year, startMonth, months: Array.from({ length: 13 - startMonth }, (_, index) => startMonth + index) };
}
