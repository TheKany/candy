"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import type { MemberPayments } from "@/types/adminTypes";
import { AdminPage } from "./AdminChrome";
export default function MemberPaymentHistory({ memberNumber }: { memberNumber: string }) {
  const auth = useAuth();
  const [data, setData] = useState<MemberPayments | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setData(null); setError("");
    if (!auth.account?.isAdmin) return;
    const controller = new AbortController();
    fetch(`/api/admin/members/${encodeURIComponent(memberNumber)}`, { cache: "no-store", signal: controller.signal })
      .then(async response => { const body = await response.json(); if (!response.ok) throw new Error(body.error); if (!controller.signal.aborted) setData(body); })
      .catch(error => { if (!controller.signal.aborted) setError(error.message || "결제 내역을 불러오지 못했어요."); });
    return () => controller.abort();
  }, [auth.account?.id, auth.account?.isAdmin, memberNumber, attempt]);
  return <AdminPage><nav><Link href="/admin/members">← 회원 목록</Link><span>결제 내역</span></nav><p className="eyebrow">TAROTART · PAYMENTS</p><h1>회원 결제 내역</h1>
    {auth.status === "loading" ? <p>접근 권한을 확인하고 있어요.</p> : !auth.account?.isAdmin ? <p role="alert">관리자만 이용할 수 있어요.</p> : <>
      <p className="number">{memberNumber}</p>
      {error ? <p className="error" role="alert">{error} <button className="plain" onClick={() => setAttempt(value => value + 1)}>다시 확인</button></p> : !data ? <p role="status">결제 내역을 확인하고 있어요.</p> : <>
        {!data.payments.length && <p className="empty">결제 내역이 없습니다.</p>}
        {!data.paymentsConnected && <p className="note">결제 서비스 연결 전이에요. 연결 후 실제 결제 내역이 표시됩니다.</p>}
        <ul className="member-list">{data.payments.map(payment => <li className="member" key={payment.id}><time>{new Date(payment.createdAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</time><h2>{payment.product}</h2><p>{payment.amount.toLocaleString("ko-KR")}원 · {payment.status}</p></li>)}</ul>
      </>}
    </>}
  </AdminPage>;
}
