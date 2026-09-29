import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { DailyReadingResult } from '../util/dailyReadingWriter';

type DailyState = {
  drawId: string; cardId: number | null; result: DailyReadingResult | null;
  begin: () => void; select: (cardId: number) => void;
  complete: (drawId: string, result: DailyReadingResult) => void;
};
export const useDailyReadingStore = create<DailyState>()(persist((set) => ({
  drawId: '', cardId: null, result: null,
  begin: () => set({drawId:crypto.randomUUID(),cardId:null,result:null}),
  select: cardId => set({cardId,result:null}),
  complete: (drawId,result) => set(state => state.drawId === drawId && state.cardId === result.card.card_id ? {result} : state),
}), {name:'tarotart-daily-reading', storage:createJSONStorage(()=>sessionStorage), skipHydration:true}));
