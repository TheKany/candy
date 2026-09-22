"use client";

import { useQuestionStore } from "@/store/useQuestionStore";
import { useUserPickNum } from "@/store/useUserPickNumStore";
import type { TarotReadingResult } from "@/types/tarotReadingTypes";
import { buildTarotResultPresentation } from "@/util/tarotResultPresentation";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { getNavigationButtonTarget } from "@/util/horizontalResultPager";
import { Shell, Header, Viewport, Track, Slide, SummaryCard, Eyebrow, FlowLine, CardPage, English, CardImage, Reading, Advice, Question, Pager, NavButton, Dots, Dot, NavigationHint, Status as StatusMessage } from "./ResultPager.styles";
import { loadPersonalReading } from "@/util/loadPersonalReading";

const OneCardResult = ({ onHome, children }: { onHome: () => void; children?: ReactNode }) => {
  const pickedCards = useUserPickNum((state) => state.realCard);
  const question = useQuestionStore((state) => state.question);
  const cardId = pickedCards[0];
  const [result, setResult] = useState<TarotReadingResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    if (cardId === undefined || !question.trim()) return;

    const controller = new AbortController();
    setErrorMessage(""); setResult(null); setActivePage(0);

    const loadReading = async () => {
      try {
        const written = await loadPersonalReading("one", [String(cardId)], controller.signal);
        if (!controller.signal.aborted) setResult(written as TarotReadingResult);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          if (!controller.signal.aborted) setErrorMessage(error instanceof Error ? error.message : "해설을 완성하지 못했어요.");
        }
      }
    };

    const timer = setTimeout(() => { void loadReading(); }, 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [cardId, question, attempt]);

  if (cardId === undefined || !question.trim()) {
    return <StatusMessage>질문과 선택한 카드를 확인해주세요.</StatusMessage>;
  }

  if (errorMessage) return <StatusMessage><p>{errorMessage}</p><button onClick={() => setAttempt((value) => value + 1)}>같은 카드로 다시 해설하기</button><p><Link href="/topic">질문 확인하기</Link></p></StatusMessage>;
  if (!result) return <StatusMessage role="status" aria-live="polite" aria-busy="true">당신의 질문에 맞춰 카드의 이야기를 풀고 있어요.<br />화면을 나가지 않고 잠시 기다려주세요.</StatusMessage>;

  const { card, reading, fallback } = result;
  const presentation = reading ? buildTarotResultPresentation(reading) : null;

  const hasReading = !fallback && !!reading && !!presentation;
  const moveWithButton = (direction: "previous" | "next") =>
    setActivePage((page) => getNavigationButtonTarget(page, direction, 3));

  return (
    <Shell>
      <Header><span>내 질문에 대한 답</span><strong>한 장의 이야기</strong></Header>
      <Viewport>
        <Track $page={activePage}>
          <Slide aria-hidden={activePage !== 0} inert={activePage !== 0}>
            <SummaryCard>
              <Eyebrow>한 장이 전하는 답</Eyebrow>
              <h1>{presentation?.conclusion ?? card.upright_one_line}</h1>
              <FlowLine><span>{card.name_ko}</span></FlowLine>
            </SummaryCard>
          </Slide>
          <Slide aria-hidden={activePage !== 1} inert={activePage !== 1}>
            <CardPage>
              <h2>{card.name_ko}</h2>
              <English>{card.name_en}</English>
              <FlowLine>{card.upright_keywords.slice(0, 5).join(" · ")}</FlowLine>
              <CardImage>
                <Image src={`/cards/card${card.card_id}.webp`} alt={`${card.name_ko} 타로 카드`} width={124} height={207} priority />
              </CardImage>
              {hasReading ? (
                <Reading>
                  <strong>{presentation.headline}</strong>
                  {presentation.details.map(([title, text]) => (
                    <section key={title} aria-label={title}>
                      {text.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                    </section>
                  ))}
                </Reading>
              ) : (
                <Reading><strong>카드가 전하는 흐름</strong><p>지금의 상황과 맞닿는 부분부터 천천히 살펴보세요.</p></Reading>
              )}
            </CardPage>
          </Slide>
          <Slide aria-hidden={activePage !== 2} inert={activePage !== 2}>
            <SummaryCard>
              <Eyebrow>마지막으로, 지금 해볼 수 있는 일</Eyebrow>
              {hasReading ? (
                <>
                  <Advice><span>카드가 권하는 한 가지</span><p>{presentation.advice}</p></Advice>
                  <Question><span>나에게 묻는 질문</span><br />{presentation.reflectionQuestion}</Question>
                </>
              ) : <Advice><p>지금의 상황과 맞닿는 부분부터 천천히 살펴보세요.</p></Advice>}
              {children}
            </SummaryCard>
          </Slide>
        </Track>
      </Viewport>
      <Pager aria-label="원 오라클 결과 페이지">
        <NavButton type="button" disabled={activePage === 0} onClick={() => moveWithButton("previous")}>이전</NavButton>
        <Dots>
          {[0, 1, 2].map((page) => <Dot key={page} aria-label={`${page + 1} / 3 페이지`} aria-current={activePage === page ? "page" : undefined} $active={activePage === page} />)}
        </Dots>
        {activePage === 2
          ? <NavButton type="button" $home onClick={onHome}>홈으로</NavButton>
          : <NavButton type="button" onClick={() => moveWithButton("next")}>{activePage === 0 ? "카드 해설" : "다음"}</NavButton>}
      </Pager>
      <NavigationHint>아래 이전·다음 버튼으로 카드의 이야기를 확인하세요</NavigationHint>
    </Shell>
  );
};

export default OneCardResult;
