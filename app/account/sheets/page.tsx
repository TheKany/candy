"use client";
import Link from "next/link";
import { AccountPageShell } from "@/components/account/AccountChrome";
import { useAuth } from "@/components/auth/AuthProvider";
export default function Page(){
  const auth=useAuth();
  return <AccountPageShell>
    <nav><Link href="/account">← 마이페이지</Link><span>타르트 시트 구매</span></nav>
    <h1>다음 이야기를 준비해요</h1>
    {auth.status==='super'?<p>무료 이용 계정이에요. 상담에 시트가 필요하지 않아요.</p>:<>
      <p>타르트 시트 구매를 준비하고 있어요.<br/>지금은 결제가 진행되지 않습니다.</p>
      <section id="premium" aria-labelledby="premium-title"><h2 id="premium-title">고급 시트 · 1장 990원</h2><p className="muted">처음 타로 상담을 볼 때 사용해요.</p></section>
      <section id="basic" aria-labelledby="basic-title"><h2 id="basic-title">기본 시트 · 1장 500원</h2><p className="muted">연계질문을 볼 때 사용해요.<br/>광고로 받은 기본 시트도 사용 제한 없이 똑같이 쓸 수 있어요.</p></section>
      <p>마이페이지 교환소에서<br/>고급 시트 1장을 기본 시트 2장으로 바꿀 수 있어요.</p>
      {auth.status!=='loading'&&<button className="action" disabled>결제 준비 중</button>}
    </>}
  </AccountPageShell>;
}
