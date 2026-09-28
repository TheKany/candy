"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { useAuth } from "@/components/auth/AuthProvider";
import type { MyPageData } from "@/types/mypageTypes";
import { loadDashboard, readDashboardSummary } from "@/util/accountDashboardCache";

export default function SelectionAccountSummary() {
  const auth = useAuth();
  const [data, setData] = useState<MyPageData | null>(() => auth.account ? readDashboardSummary(auth.account.id) : null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => { setData(auth.account ? readDashboardSummary(auth.account.id) : null); }, [auth.account?.id]);
  useEffect(() => {
    setFailed(false);
    if (!auth.account) return;
    const controller = new AbortController();
    void loadDashboard(auth.account.id)
      .then(next => {
        if (!controller.signal.aborted) setData(next);
      })
      .catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [auth.account?.id, attempt]);

  useEffect(() => {
    const refresh = () => setAttempt(value => value + 1);
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  useEffect(() => {
    if (!data) return;
    const midnight = Date.parse(`${data.day}T00:00:00+09:00`) + 86400000;
    const timer = setTimeout(() => setAttempt(value => value + 1), Math.max(1000, midnight - Date.now() + 1000));
    return () => clearTimeout(timer);
  }, [data?.day]);

  const loading = auth.status === "loading" || Boolean(auth.account && !data && !failed);
  if (!loading && !auth.account) return <Summary aria-label="비회원 이용 안내"><strong>비회원으로 이용 중이에요</strong><p>{auth.error || "보유 이용권과 무료 시트는 로그인 후 확인할 수 있어요."}</p><button onClick={auth.signIn}>카카오로 로그인</button></Summary>;

  const unavailable = failed ? "확인 불가" : "확인 중…";
  return <Summary aria-label="내 주문서와 타르트 시트" aria-busy={loading}>
    <dl>
      <div><dt>타르트 주문서</dt><dd className="muted"><Value $loading={loading} aria-hidden={loading || undefined}>{loading ? "이용 안내" : auth.status === "super" ? "무료 이용" : "준비 중"}</Value></dd></div>
      <div><dt>타르트 시트</dt><dd className="balances"><span>무료 <b><Value $loading={loading} aria-hidden={loading || undefined}>{loading ? "00장" : auth.status==='super'?'-장':data ? `${data.free}장` : unavailable}</Value></b></span><span>유료 <b><Value $loading={loading} aria-hidden={loading || undefined}>{loading ? "00장" : auth.status==='super'?'-장':data ? `${data.paid}장` : unavailable}</Value></b></span></dd></div>
      <div><dt>오늘의 무료 시트</dt><dd><Value $loading={loading} aria-hidden={loading || undefined}>{loading ? "오늘의 시트" : auth.status === "super" ? <span className="muted">시트 없이 이용</span> : !data ? <span className="muted">{unavailable}</span> : data.ads >= 3 ? <span className="received">받았어요 ✓</span> : <Link href="/account">{data.adsAvailable ? `받기 · ${data.ads}/3` : "광고 준비 중"}</Link>}</Value></dd></div>
    </dl>
    {failed && <p role="alert">시트 정보를 불러오지 못했어요. <button onClick={() => setAttempt(value => value + 1)}>다시 확인</button></p>}
  </Summary>;
}

const Value = styled.span<{ $loading: boolean }>`
  display: inline-block;
  filter: ${({ $loading }) => $loading ? "blur(4px)" : "blur(0)"};
  opacity: ${({ $loading }) => $loading ? 0.35 : 1};
  user-select: ${({ $loading }) => $loading ? "none" : "auto"};
  transition: filter 150ms ease-out, opacity 150ms ease-out;
  @media (prefers-reduced-motion: reduce) { transition: none; }
`;

const Summary = styled.section`
  position: relative;
  z-index: 1;
  margin-top: 8px;
  padding: 16px;
  border: 1px solid #edcf8a26;
  border-radius: 16px;
  background: #ffffff06;
  font-size: 13px;
  line-height: 1.6;
  dl { margin: 0; display: grid; gap: 12px; }
  dl > div { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 4px 12px; }
  dt { color: #c7ceb9; }
  dd { margin: 0 0 0 auto; text-align: right; color: #f1d58f; }
  .balances { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 4px 12px; }
  .balances span { white-space: nowrap; }
  b { margin-left: 3px; font-weight: 700; }
  .muted, p { color: #c7ceb9; }
  .received { color: #dce7b0; }
  p { margin: 10px 0 0; font-size: 12px; word-break: keep-all; }
  a, button { color: #f1d58f; text-decoration: underline; text-underline-offset: 4px; }
  button { font: inherit; background: none; border: 0; min-height: 44px; cursor: pointer; }
  a { display: inline-flex; align-items: center; min-height: 44px; margin: -10px 0; }
  a:focus-visible, button:focus-visible { outline: 2px solid #f1d58f; outline-offset: 3px; }
  @media (max-width: 319px) { padding: 12px; font-size: 12px; }
`;
