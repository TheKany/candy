"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styled from "styled-components";
import { useAuth } from "@/components/auth/AuthProvider";
import { REPRESENTATIVE_CARDS } from "@/constants/representativeCards";
import type { MyPageData } from "@/types/mypageTypes";
import { AccountPageShell } from "./AccountChrome";
import TartStamps from "./TartStamps";
import { rewardDisplay } from "@/util/mypageRules";
import Loading from "@/components/_common/Loading";
import { loadDashboard, readDashboard, invalidateDashboard } from "@/util/accountDashboardCache";
import { clearSavedActivity } from '@/util/readingPresentation';
import ActivityList from './ActivityList';
import SheetExchange from './SheetExchange';
const kinds: Record<string,string>={one:"한 장 타로",three:"세 장 타로",five:"다섯 장 타로",monthly:"월별 타로",saved:"저장한 타로"};
export default function MyPage(){
  const auth=useAuth(); const [data,setData]=useState<MyPageData|null>(()=>auth.account?readDashboard(auth.account.id):null);const [error,setError]=useState("");const [busy,setBusy]=useState(true);const [attempt,setAttempt]=useState(0);
  const refresh=useCallback(()=>setAttempt(n=>n+1),[]);
  const removeSaved=async(savedId:string)=>{
    const response=await fetch(`/api/consultations/${encodeURIComponent(savedId)}`,{method:'DELETE'});
    if(!response.ok)throw new Error('DELETE_FAILED');
    if(auth.account)invalidateDashboard(auth.account.id);
    setData(previous=>previous?{...previous,activities:clearSavedActivity(previous.activities,savedId)}:previous);
  };
  useEffect(()=>{setData(auth.account?readDashboard(auth.account.id):null);},[auth.account?.id]);
  useEffect(()=>{setError("");if(!auth.account)return;const controller=new AbortController();setBusy(true);
    loadDashboard(auth.account.id).then(value=>{if(!controller.signal.aborted)setData(value);}).catch(()=>{if(!controller.signal.aborted)setError("마이페이지를 불러오지 못했어요. 잠시 후 다시 시도해주세요.");}).finally(()=>{if(!controller.signal.aborted)setBusy(false);});return()=>controller.abort();
  },[auth.account?.id,attempt]);
  useEffect(()=>{const onFocus=()=>refresh();window.addEventListener("focus",onFocus);return()=>window.removeEventListener("focus",onFocus);},[refresh]);
  useEffect(()=>{if(!data)return;const midnight=Date.parse(`${data.day}T00:00:00+09:00`)+86400000;const timer=setTimeout(refresh,Math.max(1000,midnight-Date.now()+1000));return()=>clearTimeout(timer);},[data?.day,refresh]);
  const more=async()=>{if(!data||busy)return;setBusy(true);setError("");try{const response=await fetch(`/api/account/dashboard?offset=${data.nextOffset??data.activities.length}`,{cache:"no-store"});if(!response.ok)throw new Error();const next:MyPageData=await response.json();setData(previous=>previous?{...next,activities:[...previous.activities,...next.activities.filter(n=>!previous.activities.some(p=>p.consultation_id===n.consultation_id&&p.ordinal===n.ordinal))]}:next);}catch{setError("이용내역을 더 불러오지 못했어요.");}finally{setBusy(false);}};
  const card=data?.representativeCard!=null?REPRESENTATIVE_CARDS[data.representativeCard]:null;
  const balance=data?rewardDisplay(data.ads,data.premium,data.basic):null;
  if(auth.status==="loading" || (auth.account && !data && busy)) return <Loading message="내 공간을 준비하고 있어요" />;
  return <Page className="page-enter"><nav><Link href="/">← 홈으로</Link><span>마이페이지</span></nav>
    {!auth.account?<section className="status"><h1>나만의 타로타르트</h1><p>{auth.error||"로그인하고 내 카드와 이야기를 모아보세요."}</p><button className="action" onClick={auth.signIn}>카카오로 로그인</button></section>:<><div className="account-content">
      {error&&<p className="error" role="alert">{error} <button className="plain" onClick={refresh}>다시 시도</button></p>}
      {data&&<>
        <section className="profile"><Link href="/account/card" className="representative" aria-label="대표 카드 고르기">{card?<Image src={`/cards/card${card.id}.webp`} width={116} height={194} alt={card.name}/>:<span className="card-back" aria-hidden="true">✦</span>}<small>{card?"대표 카드 바꾸기":"대표 카드 고르기"}</small></Link><div><small className="muted">나의 계정</small><h1>나를 위한<br/>작은 타르트</h1><span className="grade"><span aria-hidden="true">{auth.status==="super"?"☀":"☆"}</span> {auth.status==="super"?"슈퍼 계정":"일반 계정"}</span></div></section>
        <section aria-label="보유 시트">
          <header className="sheet-heading"><h2>보유한 시트</h2>{auth.status!=='super'&&<Link href="/account/sheets" className="buy">시트 구매</Link>}</header>
          <div className="sheet-row">
            <div><span>고급 시트</span><small>처음 타로 상담을 볼 때 사용해요</small>{auth.status!=='super'&&<small>1장 990원</small>}</div>
            <strong>{auth.status==='super'?'-':data.premium}<small> 장</small></strong>
          </div>
          <div className="sheet-row">
            <div><span>기본 시트</span><small>연계질문에 사용 · 하루 사용 제한 없음</small>{auth.status!=='super'&&<small>1장 500원</small>}</div>
            <strong>{auth.status==='super'?'-':data.basic}<small> 장</small></strong>
          </div>
        </section>
        {auth.status!=='super'&&<SheetExchange premium={data.premium} available={data.exchangeAvailable} onExchanged={()=>{if(auth.account)invalidateDashboard(auth.account.id);refresh();}}/>}
        {auth.status==="super"?<p className="super-note">무료 이용 계정이에요. 상담에 시트가 필요하지 않아요.</p>:<TartStamps ads={balance?.stamps??0} available={data.adsAvailable}/>}
        <header className="history-heading"><h2>지금까지 먹은 타르트</h2><strong>{data.total}<small> 개</small></strong></header>
        {!data.activities.length&&<p className="empty">아직 나눈 이야기가 없어요.<br/>첫 타르트를 만나러 가볼까요?</p>}
        <ActivityList items={data.activities} onDelete={removeSaved}/>
        {data.hasMore&&<button className="plain more" disabled={busy} onClick={more}>{busy?"불러오는 중…":"내역 더 보기"}</button>}
      </>}
      </div><footer>{auth.account.isAdmin && <Link href="/admin/members">관리자 페이지</Link>}<a href="mailto:kaanzy@naver.com">문의하기</a><Link href="/privacy">개인정보 안내</Link><button className="plain" onClick={auth.signOut}>로그아웃</button></footer>
    </>}
  </Page>;
}
const Page=styled(AccountPageShell)`
  .sheet-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-bottom:12px;}.sheet-heading h2{margin:0;font-size:15px;}.sheet-heading .buy{flex-shrink:0;}
  height:var(--app-height,100dvh);min-height:0;display:flex;flex-direction:column;overflow:hidden;padding-bottom:calc(8px + env(safe-area-inset-bottom));
  >nav{flex-shrink:0;min-height:48px;}.account-content{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;overflow-x:hidden;} >footer{flex-shrink:0;margin-top:0;padding-top:8px;border-top:1px solid #ddcc9f30;min-height:52px;}
  .profile{display:grid;grid-template-columns:116px minmax(0,1fr);gap:24px;align-items:center;padding:24px 0;}.profile h1{margin:8px 0 14px;font-size:23px;}.profile small{font-size:11px;}.representative{text-align:center;}.representative img{display:block;width:100%;height:auto;border-radius:9px;border:1px solid #bda36d;}.representative small{display:block;margin-top:8px;color:#bdcbbd;}.card-back{display:grid;place-items:center;height:194px;border:1px solid #bda36d;border-radius:9px;background:repeating-linear-gradient(45deg,#174533 0 10px,#204c3d 10px 11px);color:#edcf8a;font-size:32px;}.grade{display:inline-flex;align-items:center;gap:6px;padding:7px 10px;border:1px solid #dec68160;border-radius:20px;color:#edcf8a;font-size:13px;}.sheet-row{display:flex;align-items:center;gap:9px;border-top:1px solid #ddcc9f30;padding:16px 0;font-size:14px;}.sheet-row:last-child{border-bottom:1px solid #ddcc9f30;}.sheet-row>div{min-width:0;}.sheet-row small{display:block;font-size:11px;color:#bdcbbd;margin-top:4px;line-height:1.6;}.sheet-row strong{margin-left:auto;font-size:21px;color:#edcf8a;white-space:nowrap;font-weight:500;}.sheet-row strong small,.history-heading small{display:inline;font-size:12px;color:#bdcbbd;}.buy{padding:8px 10px;background:#edcf8a;color:#173b2c;border-radius:7px;font-size:12px;min-height:44px;display:grid;place-items:center;}.gift{width:44px;text-align:center;flex-shrink:0;color:#edcf8a;}.super-note{color:#d9c894;font-size:12px;}.history-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:23px 0 8px;}.history-heading h2{font-size:15px;margin:0;}.history-heading strong{font-size:20px;font-weight:500;color:#edcf8a;}.activities{padding:0;margin:0;list-style:none;}.activities li{border-bottom:1px solid #ddcc9f30;}.record{display:flex;align-items:center;gap:10px;padding:17px 0;}.record-copy{flex:1;min-width:0;}.record time{font-size:11px;color:#bdcbbd;}.topic{display:block;margin-top:7px;color:#edcf8a;font-size:12px;}.record-title{display:block;font-size:14px;margin-top:6px;line-height:1.7;overflow-wrap:anywhere;}.arrow{font-size:25px;color:#edcf8a;}.unsaved{font-size:11px;color:#afbcaf;white-space:nowrap;}.empty{color:#bdcbbd;padding:12px 0;}.more{width:100%;}footer{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:16px;font-size:11px;color:#bdcbbd;margin-top:20px;}footer .plain{font-size:11px;padding:8px 0;}
  @media(max-width:320px){.profile{grid-template-columns:94px minmax(0,1fr);gap:16px;}.card-back{height:157px;}.profile h1{font-size:21px;}.sheet-row{font-size:12px;gap:7px;}.history-heading h2{font-size:14px;}}
`;
