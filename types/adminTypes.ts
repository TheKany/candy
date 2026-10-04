export type MemberRole = "member" | "super";
export type AdminMember = {
  memberNumber: string; createdAt: string; role: MemberRole; status: "unused" | "active" | "dormant";
  kakaoEmail?: string | null;
  usageCount?: number;
  basicPurchaseCount?: number;
  premiumPurchaseCount?: number;
};
export type AdminMemberList = { items: AdminMember[]; hasMore: boolean };
export type MemberPayments = { memberNumber: string; payments: { id: string; createdAt: string; product: string; amount: number; status: string }[]; paymentsConnected: boolean };
