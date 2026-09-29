"use client";
import Link from "next/link";
import { AccountPageShell } from "@/components/account/AccountChrome";
export default function Page(){return <AccountPageShell><nav><Link href="/account">← 마이페이지</Link><span>타르트 시트 구매</span></nav><h1>다음 이야기를 준비해요</h1><p>타르트 시트 구매를 준비하고 있어요.<br/>지금은 결제가 진행되지 않습니다.</p><p className="muted">고급 시트는 처음 타로 상담에,<br/>기본 시트는 연계질문에 사용해요.<br/>광고로 받은 기본 시트도 사용 제한 없이 똑같이 쓸 수 있어요.</p><p>마이페이지 교환소에서<br/>고급 시트 1장을 기본 시트 2장으로 바꿀 수 있어요.</p><button className="action" disabled>결제 준비 중</button></AccountPageShell>;}
