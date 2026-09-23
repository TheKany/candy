import { create } from "zustand";
import { getMonthlyPeriod } from "@/util/monthlyReading";
import type { MonthlyPeriod, MonthlyReadingResult } from "@/types/monthlyReadingTypes";

// Keep dates and readings only in memory for this visit.
export const useMonthlyReadingStore = create<{
  period: MonthlyPeriod | null;
  result: MonthlyReadingResult | null;
  start: () => void;
  saveResult: (result: MonthlyReadingResult) => void;
  reset: () => void;
}>((set) => ({
  period: null, result: null,
  start: () => set({ period: getMonthlyPeriod(), result: null }),
  saveResult: (result) => set({ result }),
  reset: () => set({ period: null, result: null }),
}));
