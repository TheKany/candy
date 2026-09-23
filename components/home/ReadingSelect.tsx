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
import { useRef, useState } from "react";
import styled from "styled-components";
import { handleResetStore } from "@/util/handleResetStore";
import { useMonthlyReadingStore } from "@/store/useMonthlyReadingStore";
import { getMonthlyPeriod, type MonthlyYearChoice } from "@/util/monthlyReading";

export default function ReadingSelect() {
  const [notice, setNotice] = useState("");
  const yearDialog = useRef<HTMLDialogElement>(null);
  const [yearChoice, setYearChoice] = useState<MonthlyYearChoice>("current");
  const [currentPeriod, setCurrentPeriod] = useState<ReturnType<typeof getMonthlyPeriod> | null>(null);
  const router = useRouter();
  const setType = useTarotTypeStore((state) => state.setType);

  const handleSelect = (id: TarotTypeId) => {
    const action = getTarotSelectionAction(id);

    if (action.kind === "navigate") {
      if (action.type === "monthly") {
        setCurrentPeriod(getMonthlyPeriod());
        setYearChoice("current");
        yearDialog.current?.showModal();
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

  return (
    <Main>
      <TopBar>
        <BackButton
          type="button"
          aria-label="이전 화면으로 돌아가기"
          onClick={() => router.back()}
        >
          <span aria-hidden>←</span>
          뒤로
        </BackButton>
        <HomeLink href="/">홈으로</HomeLink>
      </TopBar>

      <Header>
        <Eyebrow>CHOOSE YOUR READING</Eyebrow>
        <Title>어떤 타로를 볼까요?</Title>
        <Description>지금 마음에 가장 가까운 리딩을 골라보세요.</Description>
      </Header>

      <CardList aria-label="타로 리딩 유형">
        {TAROT_TYPES.map((option) => (
          <TarotTypeCard key={option.id} option={option} onSelect={handleSelect} />
        ))}
      </CardList>

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

const BackButton = styled.button`
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  gap: 6px;
  padding: 0 6px;
  color: #fff6dc;
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 700;

  span {
    color: #f2ce72;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 1.3rem;
  }

  &:focus-visible {
    outline: 3px solid #fff6dc;
    outline-offset: -3px;
  }
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
  margin: clamp(20px, 5vh, 42px) 0 clamp(18px, 4vh, 30px);
  text-align: center;
`;

const Eyebrow = styled.p`
  margin: 0 0 10px;
  color: #f2ce72;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
`;

const Title = styled.h1`
  margin: 0;
  color: #fff6dc;
  font-size: clamp(1.75rem, 9vw, 2.35rem);
  font-weight: 900;
  letter-spacing: -0.06em;
  line-height: 1.18;
  word-break: keep-all;
`;

const Description = styled.p`
  max-width: 27ch;
  margin: 12px auto 0;
  color: rgb(255 247 223 / 80%);
  font-size: clamp(0.88rem, 3.8vw, 1rem);
  line-height: 1.6;
  word-break: keep-all;
`;

const CardList = styled.section`
  position: relative;
  z-index: 1;
  display: grid;
  min-width: 0;
  gap: clamp(10px, 2.2vh, 14px);
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
