import { create } from "zustand";
import { getMonthlyPeriod, type MonthlyYearChoice } from "@/util/monthlyReading";
import type { MonthlyPeriod, MonthlyReadingResult } from "@/types/monthlyReadingTypes";

// Keep dates and readings only in memory for this visit.
export const useMonthlyReadingStore = create<{
  period: MonthlyPeriod | null;
  result: MonthlyReadingResult | null;
  start: (choice?: MonthlyYearChoice) => void;
  saveResult: (result: MonthlyReadingResult) => void;
  reset: () => void;
}>((set) => ({
  period: null, result: null,
  start: (choice = "current") => set({ period: getMonthlyPeriod(new Date(), choice), result: null }),
  saveResult: (result) => set({ result }),
  reset: () => set({ period: null, result: null }),
}));
