export type AccountActivity = { consultation_id: string; ordinal: number; kind: string; topic: string; created_at: string; savedId: string | null; title?: string };
export type MyPageData = {
  nextOffset?: number;
  representativeCard: number | null;
  premium: number; basic: number; ads: number; exchangeAvailable: boolean;
  day: string; total: number; activities: AccountActivity[]; hasMore: boolean;
  adsAvailable: false; paymentsAvailable: false;
};
