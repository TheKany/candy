export type AccountActivity = { consultation_id: string; ordinal: number; kind: string; topic: string; created_at: string; savedId: string | null; title?: string };
export type MyPageData = {
  representativeCard: number | null;
  paid: number; free: number; ads: number; freeUsedToday: boolean;
  day: string; total: number; activities: AccountActivity[]; hasMore: boolean;
  adsAvailable: false; paymentsAvailable: false;
};
