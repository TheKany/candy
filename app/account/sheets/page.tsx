"use client";
import Link from "next/link";
import { AccountPageShell } from "@/components/account/AccountChrome";
export default function Page(){return <AccountPageShell><nav><Link href="/account">← 마이페이지</Link><span>타르트 시트 구매</span></nav><h1>다음 이야기를 준비해요</h1><p>타르트 시트 구매를 준비하고 있어요.<br/>지금은 결제가 진행되지 않습니다.</p><p className="muted">구매한 시트는 하루 사용 횟수 제한 없이,<br/>광고로 받은 무료 시트는 하루 1장씩 사용할 수 있어요.</p><button className="action" disabled>결제 준비 중</button></AccountPageShell>;}
