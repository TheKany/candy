"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styled from "styled-components";
import { useAuth } from "@/components/auth/AuthProvider";
import ReadingSaveButtons from "@/components/result/ReadingSaveButtons";
import type { ReadingExport } from "@/util/readingExportLayout";
type Summary = { id: string; revision: number; updated_at: string };
export default function SavedReadings({ id }: { id?: string }) {
  const auth = useAuth();
  const [items, setItems] = useState<Summary[]>([]);
  const [readings, setReadings] = useState<ReadingExport[]>([]);
  const [error, setError] = useState(""); const [busy, setBusy] = useState(true); const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setItems([]); setReadings([]); setError("");
    if (auth.status !== "member") return;
    const controller = new AbortController(); setBusy(true);
    fetch(id ? `/api/consultations/${encodeURIComponent(id)}` : "/api/consultations", { cache: "no-store", signal: controller.signal })
      .then(async response => { if (!response.ok) throw new Error(); const body = await response.json(); if (!controller.signal.aborted) { if (id) setReadings(body.readings); else setItems(body.readings); } })
      .catch(() => { if (!controller.signal.aborted) setError("기록을 불러오지 못했어요. 삭제됐거나 연결이 원활하지 않을 수 있어요."); })
      .finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, [auth.account?.id, auth.status, id, attempt]);
  const remove = async (recordId: string) => {
    if (!window.confirm("이 상담 기록을 삭제할까요? 삭제한 기록은 다시 볼 수 없어요.")) return;
    try {
      const response = await fetch(`/api/consultations/${recordId}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      setItems(list => list.filter(item => item.id !== recordId));
    } catch { setError("기록을 삭제하지 못했어요. 다시 시도해주세요."); }
  };
  return <Page><nav><Link href={id ? "/account" : "/"}>{id ? "← 내 기록" : "← 홈으로"}</Link>{auth.account && <button type="button" onClick={auth.signOut}>로그아웃</button>}</nav>
    <small>나를 위한 타로타르트</small><h1>{id ? "다시 꺼낸 이야기" : "내 타로 기록"}</h1>
    {auth.status === "loading" ? <p role="status">로그인을 확인하고 있어요…</p> : auth.status === "super" ? <p>슈퍼 계정의 질문과 해설은 별도로 저장하지 않아요.</p> : auth.status !== "member" ? <><p>{auth.error || "카카오 로그인 후 내 기록을 볼 수 있어요."}</p><button type="button" onClick={auth.signIn}>카카오로 로그인</button></> : <>
      {busy && <p role="status">기록을 꺼내고 있어요…</p>}
      {error && <p role="alert">{error} <button type="button" onClick={() => setAttempt(value => value + 1)}>다시 시도</button></p>}
      {!id && !busy && !error && !items.length && <p>아직 저장한 이야기가 없어요.<br />상담 후 ‘내 기록에 저장’을 눌러보세요.</p>}
      {!id && items.map(item => <article key={item.id}><Link href={`/account/readings/${item.id}`}><h2>{new Date(item.updated_at).toLocaleDateString("ko-KR")}의 이야기</h2><p>처음 질문{item.revision > 1 ? ` + 연계 질문 ${item.revision - 1}개` : ""}</p></Link><button type="button" onClick={() => remove(item.id)}>삭제</button></article>)}
      {id && readings.map((reading, index) => <article key={index}><h2>{index ? `연계 질문 ${index}` : reading.title}</h2><p className="question">{reading.question || reading.keywords?.join(" · ")}</p>
        {reading.sections.map((section, i) => <section key={i}>{section.cardId !== undefined && <Image src={`/cards/card${section.cardId}.webp`} width={96} height={160} alt={section.title} />}<h3>{section.title}</h3><p>{section.text}</p></section>)}
      </article>)}
      {id && readings.length > 0 && <ReadingSaveButtons data={{ title: "다시 꺼낸 이야기", sections: [], readings }} />}
    </>}
  </Page>;
}
const Page = styled.main`
  width:100%;min-height:100dvh;padding:24px clamp(14px,5vw,24px);box-sizing:border-box;background:linear-gradient(160deg,#08261d,#0c3427);color:#fff7df;
  nav{display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;}nav a,a{color:inherit;text-decoration:none;}small{color:#edcf8a;font-size:12px;}h1{font-size:26px;line-height:1.5;margin:12px 0 24px;}h2{font-size:18px;line-height:1.6;}h3{font-size:15px;margin:24px 0 8px;}
  p{font-size:14px;line-height:1.9;white-space:pre-wrap;overflow-wrap:anywhere;}article{padding:20px 16px;margin:16px 0;border:1px solid #edcf8a60;border-radius:18px;background:#ffffff06;}section img{display:block;margin:24px auto 12px;}.question{color:#edcf8a;}
  button{min-height:44px;padding:8px 14px;border:1px solid #edcf8a60;border-radius:10px;background:transparent;color:inherit;cursor:pointer;font:inherit;font-size:13px;}button:focus-visible,a:focus-visible{outline:2px solid #edcf8a;outline-offset:3px;}
`;
