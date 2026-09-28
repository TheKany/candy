"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { useAuth } from "@/components/auth/AuthProvider";
import { REPRESENTATIVE_CARDS as cards } from "@/constants/representativeCards";
import { AccountPageShell } from "./AccountChrome";
import Loading from "@/components/_common/Loading";
export default function RepresentativeCardPicker(){
  const auth=useAuth();const router=useRouter();const [index,setIndex]=useState(17);const [busy,setBusy]=useState(false);const [loading,setLoading]=useState(true);const [error,setError]=useState("");const [attempt,setAttempt]=useState(0);
  useEffect(()=>{if(!auth.account){setLoading(false);return;}const controller=new AbortController();setLoading(true);setError("");fetch("/api/account/dashboard",{cache:"no-store",signal:controller.signal}).then(async response=>{if(!response.ok)throw new Error();const data=await response.json();if(!controller.signal.aborted)setIndex(data.representativeCard??17);}).catch(()=>{if(!controller.signal.aborted)setError("대표 카드를 불러오지 못했어요.");}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});return()=>controller.abort();},[auth.account?.id,attempt]);
  const save=async(cardId:number|null)=>{if(busy)return;setBusy(true);setError("");try{const response=await fetch("/api/account/representative-card",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({cardId})});if(!response.ok)throw new Error();router.push("/account");}catch{setError("카드를 저장하지 못했어요. 다시 시도해주세요.");setBusy(false);}};
  const card=cards[index];
  if(auth.status==="loading" || loading) return <Loading message="대표 카드를 준비하고 있어요" />;
  return <Page className="page-enter"><nav><Link href="/account">← 마이페이지</Link><span>대표 카드 선택</span></nav>
    {!auth.account?<section className="status"><p>로그인하고 대표 카드를 골라보세요.</p><button className="action" onClick={auth.signIn}>카카오로 로그인</button></section>:<>
      <h1>어떤 카드가 마음에 드나요?</h1><p className="intro">내 공간에 두고 싶은 한 장을 골라보세요.</p>
      <div className="symbol"><small>빛나는 점</small><strong>{card.positive}</strong></div>
      <div className="carousel"><button disabled={busy} aria-label="이전 카드" onClick={()=>setIndex(i=>(i+77)%78)}>‹</button><Image key={index} src={`/cards/card${card.id}.webp`} alt={card.name} width={184} height={307} priority sizes="184px"/><button disabled={busy} aria-label="다음 카드" onClick={()=>setIndex(i=>(i+1)%78)}>›</button></div>
      <div className="symbol balance"><small>함께 챙길 점</small><strong>{card.balance}</strong></div><h2 aria-live="polite">{card.name}</h2>
      <label className="select-label">다른 카드 찾아보기<select value={index} disabled={busy} onChange={event=>setIndex(Number(event.target.value))}>{cards.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <p className="hint">운세가 아닌, 카드를 고르기 위한 상징이에요.</p>
      {error&&<p className="error" role="alert">{error} <button className="plain" onClick={()=>setAttempt(n=>n+1)}>다시 불러오기</button></p>}
      <button className="action" disabled={busy} onClick={()=>save(index)}>{busy?"내 공간에 담는 중…":"이 카드를 내 공간에 두기"}</button><button className="plain clear" disabled={busy} onClick={()=>save(null)}>대표 카드 없이 둘래요</button>
    </>}
  </Page>;
}
const Page=styled(AccountPageShell)`
  h1{font-size:22px;margin-bottom:8px;}.intro{font-size:13px;color:#bacab9;margin:0;}.symbol{display:grid;justify-items:center;gap:5px;margin:20px 0 13px;}.symbol small{font-size:11px;color:#bfcdbe;}.symbol strong{font-size:19px;font-weight:500;padding:6px 20px;border-radius:30px;color:#eed08d;background:#ecd09213;}.balance{margin:13px 0 0;}.balance strong{color:#bad0dc;background:#93b4cd12;}.carousel{display:grid;grid-template-columns:38px minmax(0,1fr) 38px;gap:8px;align-items:center;max-width:300px;margin:auto;}.carousel img{display:block;max-width:100%;width:184px;height:auto;justify-self:center;border:2px solid #ddc28a;border-radius:9px;}.carousel button{width:38px;height:44px;border:1px solid #c4af7340;border-radius:22px;background:#ffffff05;color:#e6d4a7;font-size:24px;}h2{text-align:center;margin:18px 0;}.select-label{display:grid;gap:8px;font-size:12px;color:#bdcbbd;}select{width:100%;font-size:16px;min-height:44px;border:1px solid #ddcc9f40;background:#153f30;color:#f7efdb;border-radius:9px;padding:8px;}.hint{font-size:11px;text-align:center;color:#bdcbbd;}.clear{width:100%;margin-top:7px;font-size:12px;}
  .hint{margin:24px 0;line-height:1.8;}
  @media(max-width:320px){h1{font-size:20px;}.carousel{grid-template-columns:32px minmax(0,1fr) 32px;gap:6px;}.carousel button{width:32px;}.carousel img{width:155px;}}
`;
