import MemberPaymentHistory from "@/components/account/MemberPaymentHistory";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ memberNumber: string }> }) {
  return <MemberPaymentHistory memberNumber={(await params).memberNumber} />;
}
