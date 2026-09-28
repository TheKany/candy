"use client";

import TarotTypeCard from "@/components/home/TarotTypeCard";
import {
  getTarotSelectionAction,
  TAROT_TYPES,
  type TarotTypeId,
} from "@/constants/tarotTypes";
import { useTarotTypeStore } from "@/store/useTarotTypeStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import styled from "styled-components";
import { handleResetStore } from "@/util/handleResetStore";
import { useMonthlyReadingStore } from "@/store/useMonthlyReadingStore";
import { getMonthlyPeriod, type MonthlyYearChoice } from "@/util/monthlyReading";
import SelectionAccountSummary from "./SelectionAccountSummary";
import { useAuth } from "@/components/auth/AuthProvider";
import { motion, useReducedMotion } from 'framer-motion';

export default function ReadingSelect() {
  const auth = useAuth();
  const stampArcId=useId();
  const [notice, setNotice] = useState("");
  const [selectedType, setSelectedType] = useState<TarotTypeId | null>(null);
  const [stamping,setStamping]=useState(false);
  const reduced=useReducedMotion();
  const selectionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (selectionTimer.current) clearTimeout(selectionTimer.current); }, []);
  const yearDialog = useRef<HTMLDialogElement>(null);
  const [yearChoice, setYearChoice] = useState<MonthlyYearChoice>("current");
  const [currentPeriod, setCurrentPeriod] = useState<ReturnType<typeof getMonthlyPeriod> | null>(null);
  const router = useRouter();
  const setType = useTarotTypeStore((state) => state.setType);

  const openSelection = (id: TarotTypeId) => {
    const action = getTarotSelectionAction(id);

    if (action.kind === "navigate") {
      if (action.type === "monthly") {
        setCurrentPeriod(getMonthlyPeriod());
        setYearChoice("current");
        yearDialog.current?.showModal();
        setStamping(false);
        selectionTimer.current = null;
        return;
      } else {
        useMonthlyReadingStore.getState().reset();
      }
      setType(action.type);
      router.push(action.href);
      return;
    }

    setNotice(action.message);
  };

  const handleSelect = (id: TarotTypeId) => {
    if (selectionTimer.current) return;
    if (getTarotSelectionAction(id).kind !== "navigate") { openSelection(id); return; }
    setSelectedType(id);
    setNotice('');
  };

  const handleOrder = () => {
    if(!selectedType||selectionTimer.current)return;
    setStamping(true);
    selectionTimer.current=setTimeout(()=>openSelection(selectedType),reduced?0:430);
  };

  return (
    <Main>
      <TopBar>
        <HomeLink href="/">홈으로</HomeLink>
        {auth.account && <HomeLink href="/account">마이페이지</HomeLink>}
      </TopBar>

      <SelectionAccountSummary />
      <Divider />
      <OrderSheet aria-labelledby="order-title">
      <Header>
        <OrderLabel>TAROTART <span>·</span> ORDER</OrderLabel>
        <Title id="order-title"><span>주문할 타로타르트를</span>골라 주세요</Title>
        <Stamp type="button" aria-label="선택한 타로 주문하기" disabled={!selectedType||stamping} onClick={handleOrder} $ready={!!selectedType} $stamped={stamping}
          initial={false} animate={stamping&&!reduced?{scale:[1.12,0.94,1],rotate:[12,8,12]}:{scale:1,rotate:12}} transition={{duration:0.38,ease:'easeOut'}}>
          <svg className="order-label" viewBox="0 0 100 100" aria-hidden="true">
            <defs><path id={stampArcId} d="M 9 50 A 41 41 0 0 1 91 50" /></defs>
            <text><textPath href={`#${stampArcId}`} startOffset="50%" textAnchor="middle">{stamping?'주문 완료':'주문하기'}</textPath></text>
          </svg>
          <svg aria-hidden="true" viewBox="0 0 48 38" fill="none"><path d="M7 20c0-5 8-9 17-9s17 4 17 9l-4 11c-8 5-18 5-26 0L7 20Z"/><ellipse cx="24" cy="20" rx="17" ry="8"/><path d="m15 27 2 6m7-5v6m9-7-2 6"/><circle cx="21" cy="14" r="4"/><circle cx="28" cy="15" r="4"/><path d="M23 10c0-4 3-6 6-5-1 3-3 5-6 5Z"/></svg><span>마음 한 조각</span></Stamp>
      </Header>

      <CardList aria-label="타로 리딩 유형">
        {TAROT_TYPES.map((option) => (
          <TarotTypeCard key={option.id} option={option} onSelect={handleSelect} selected={selectedType === option.id} disabled={stamping} />
        ))}
      </CardList>
      <OrderFooter aria-hidden="true">MADE FOR YOUR MOMENT <span>✦</span></OrderFooter>
      </OrderSheet>

      <Notice role="status" aria-live="polite">
        {notice}
      </Notice>
      <YearDialog ref={yearDialog} aria-labelledby="monthly-year-title">
        <button className="close" type="button" aria-label="닫기" onClick={() => yearDialog.current?.close()}>×</button>
        <h2 id="monthly-year-title">어느 해를 살펴볼까요?</h2>
        <div className="choices">
          <button type="button" aria-pressed={yearChoice === "current"} onClick={() => setYearChoice("current")}>올해<strong>{currentPeriod?.year}년</strong></button>
          <button type="button" aria-pressed={yearChoice === "next"} onClick={() => setYearChoice("next")}>다음 해<strong>{currentPeriod ? currentPeriod.year + 1 : ""}년</strong></button>
        </div>
        <p aria-live="polite">{yearChoice === "current" ? `${currentPeriod?.startMonth ?? ""}월부터 12월까지, ${currentPeriod?.months.length ?? ""}장` : "1월부터 12월까지, 12장"}의 카드를 골라요.</p>
        <button className="start" type="button" onClick={() => {
          handleResetStore();
          useMonthlyReadingStore.getState().start(yearChoice);
          setType("monthly");
          yearDialog.current?.close();
          router.push("/shuffle");
        }}>카드 고르러 가기</button>
      </YearDialog>
    </Main>
  );
}

const reducedMotion = `
  @media (prefers-reduced-motion: reduce) {
    &, &::before, &::after, * {
      scroll-behavior: auto !important;
      transition: none !important;
      transform: none !important;
      animation: none !important;
    }
  }
`;

const Main = styled.main`
  position: relative;
  display: flex;
  width: 100%;
  min-height: 100dvh;
  flex-direction: column;
  padding: calc(22px + env(safe-area-inset-top))
    calc(24px + env(safe-area-inset-right))
    calc(20px + env(safe-area-inset-bottom))
    calc(24px + env(safe-area-inset-left));
  overflow-y: auto;
  color: #fff7df;
  background:
    radial-gradient(circle at 14% 14%, rgb(224 178 76 / 18%), transparent 22%),
    radial-gradient(circle at 88% 39%, rgb(105 160 113 / 15%), transparent 25%),
    linear-gradient(160deg, #08261d 0%, #0c3427 48%, #061b15 100%);

  &::before,
  &::after {
    position: absolute;
    z-index: 0;
    color: rgb(244 205 108 / 45%);
    pointer-events: none;
    content: "✦";
  }

  &::before {
    top: 22%;
    left: 8%;
    font-size: 0.75rem;
  }

  &::after {
    right: 10%;
    bottom: 18%;
    font-size: 1rem;
  }

  @media (max-width: 319px) {
    padding: calc(14px + env(safe-area-inset-top))
      calc(10px + env(safe-area-inset-right))
      calc(14px + env(safe-area-inset-bottom))
      calc(10px + env(safe-area-inset-left));
  }

  ${reducedMotion}
`;

const TopBar = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 44px;
  align-items: center;
  justify-content: space-between;
`;

const HomeLink = styled(Link)`
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  padding: 0 6px;
  color: rgb(255 247 223 / 84%);
  font-size: 0.82rem;
  text-decoration: underline;
  text-underline-offset: 4px;

  &:focus-visible {
    outline: 3px solid #fff6dc;
    outline-offset: -3px;
  }
`;

const Header = styled.header`
  position: relative;
  z-index: 1;
  padding: 24px 20px 22px;
  border-bottom: 1px dashed #aa916a80;
  text-align: left;
  @media (max-width: 319px) { padding: 20px 14px; }
`;

const OrderSheet = styled.section`
  position: relative;
  z-index: 1;
  min-width: 0;
  margin-bottom: 8px;
  color: #244636;
  background: linear-gradient(115deg, #fff8e9, #f4ead6);
  border-radius: 5px 5px 0 0;
  box-shadow: 0 12px 28px #031a1433;
  &::after {
    content: "";
    position: absolute;
    height: 8px;
    bottom: -8px;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #f4ead6 25%, transparent 25%) -8px 0,
      linear-gradient(225deg, #f4ead6 25%, transparent 25%) -8px 0;
    background-size: 16px 16px;
  }
`;

const OrderLabel = styled.p`
  margin: 0 0 18px;
  color: #8c7551;
  font-family: Georgia, serif;
  font-size: 10px;
  letter-spacing: 0.17em;
  span { padding: 0 5px; }
`;

const Stamp = styled(motion.button)<{$ready:boolean;$stamped:boolean}>`
  position: absolute;
  right: 18px;
  bottom: 25px;
  display: grid;
  justify-items: center;
  align-content: center;
  width: 65px;
  height: 65px;
  border: 1px solid ${({$stamped})=>$stamped?'#365e44':'#a37055'};
  border-radius: 50%;
  color: ${({$stamped})=>$stamped?'#fff8e9':'#a37055'};
  background:${({$stamped,$ready})=>$stamped?'#365e44':$ready?'#eadcc3':'transparent'};
  cursor:${({$ready,$stamped})=>$ready&&!$stamped?'pointer':'default'};
  transition:background 160ms ease,color 160ms ease;
  .order-label{position:absolute;top:-15px;left:-15px;width:calc(100% + 30px);height:calc(100% + 30px);overflow:visible;fill:${({$stamped})=>$stamped?'#365e44':'#a37055'};stroke:none;opacity:${({$ready})=>$ready?1:0};transition:opacity 160ms ease,fill 160ms ease;pointer-events:none;}
  .order-label text{font-family:inherit;font-size:13px;font-weight:700;letter-spacing:1px;}
  &:focus-visible{outline:2px solid #365e44;outline-offset:5px;}
  >svg:not(.order-label) { width: 39px; height: 32px; stroke: currentColor; stroke-width: 1.3; stroke-linejoin: round; stroke-linecap: round; }
  span { font-size: 8px; letter-spacing: 0.02em; }
  @media (max-width: 359px) { right: 12px; width: 48px; height: 48px; >svg:not(.order-label) { width: 28px; height: 24px; } span { font-size: 7px; } .order-label text{font-size:14px;} }
`;

const OrderFooter = styled.p`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 20px;
  padding: 14px 0 16px;
  border-top: 1px dashed #aa916a80;
  color: #8c7551;
  font-family: Georgia, serif;
  font-size: 8px;
  letter-spacing: 0.12em;
  span { font-size: 12px; }
  @media (max-width: 319px) { margin: 0 14px; }
`;

const Divider = styled.hr`
  width: 100%;
  border: 0;
  border-top: 1px solid rgb(237 207 138 / 28%);
  margin: 20px 0;
`;

const Title = styled.h1`
  margin: 0;
  padding-right: 64px;
  color: #244636;
  font-size: clamp(1.7rem, 7.4vw, 2.15rem);
  font-weight: 900;
  letter-spacing: -0.06em;
  line-height: 1.5;
  word-break: keep-all;
  span { display: block; font-size: clamp(0.85rem, 3.5vw, 1rem); font-weight: 500; letter-spacing: -0.04em; margin-bottom: 3px; }
  @media (max-width: 359px) { padding-right: 42px; }
`;

const CardList = styled.section`
  position: relative;
  z-index: 1;
  display: grid;
  min-width: 0;
  gap: 0;
  padding: 4px 16px;
  @media (max-width: 319px) { padding: 4px 10px; }
`;

const Notice = styled.p`
  position: relative;
  z-index: 1;
  min-height: 1.6rem;
  margin: clamp(14px, 3vh, 24px) 0 0;
  color: #f8dda0;
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.6;
  text-align: center;
`;

const YearDialog = styled.dialog`
  box-sizing:border-box;width:calc(100% - 32px);max-width:360px;max-height:calc(100dvh - 32px);
  margin:auto;padding:38px 20px 24px;overflow-y:auto;border:1px solid #d8bf8a;border-radius:24px;
  background:#fff8e9;color:#214433;text-align:center;
  &::backdrop{background:#03150fbb;backdrop-filter:blur(4px);}
  h2{font-size:20px;line-height:1.6;margin:0 0 22px;word-break:keep-all;}
  button{font:inherit;cursor:pointer;}
  .close{position:absolute;top:8px;right:8px;width:36px;height:36px;color:#214433;font-size:24px;}
  .choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;}
  .choices button{min-width:0;padding:16px 6px;border:1px solid #b9b9a6;border-radius:14px;color:#214433;background:transparent;}
  strong{display:block;font-size:13px;margin-top:5px;}
  [aria-pressed="true"]{background:#214433!important;color:#fff5dd!important;border-color:#214433!important;}
  p{font-size:13px;line-height:1.8;margin:20px 0;word-break:keep-all;}
  .start{width:100%;min-height:48px;padding:12px 8px;border-radius:12px;background:#edcf8a;color:#214433;font-weight:700;}
  button:focus-visible{outline:2px solid #947942;outline-offset:3px;}
`;
