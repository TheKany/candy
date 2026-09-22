"use client";

import { useQuestionStore } from "@/store/useQuestionStore";
import { useUserPickNum } from "@/store/useUserPickNumStore";
import type { ThreeCardReadingResult } from "@/types/threeCardReadingTypes";
import type { FiveCardReadingResult } from "@/types/fiveCardReadingTypes";
import { getNavigationButtonTarget } from "@/util/horizontalResultPager";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Shell, Header, Viewport, Track, Slide, SummaryCard, Overview, Eyebrow, FlowLine, Advice, CardPage, Position, English, CardImage, RoleLabel, RoleDescription, Reading, Question, Pager, NavButton, Dots, Dot, NavigationHint, Status } from "./ResultPager.styles";
import { loadPersonalReading } from "@/util/loadPersonalReading";

type Props = { onHome: () => void; mode?: "three" | "five" };

export default function ThreeCardResult({ onHome, mode = "three" }: Props) {
  const cardIds = useUserPickNum((state) => state.realCard);
  const question = useQuestionStore((state) => state.question);
  const [result, setResult] = useState<ThreeCardReadingResult | FiveCardReadingResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [activePage, setActivePage] = useState(0);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const requiredCount = mode === "five" ? 5 : 3;
    if (cardIds.length !== requiredCount || !question.trim()) return;
    const controller = new AbortController();
    setErrorMessage(""); setResult(null); setActivePage(0);

    const loadReading = async () => {
      try {
        const written = await loadPersonalReading(mode, cardIds, controller.signal);
        if (!controller.signal.aborted) setResult(written as ThreeCardReadingResult | FiveCardReadingResult);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          if (!controller.signal.aborted) setErrorMessage(error instanceof Error ? error.message : "해설을 완성하지 못했어요.");
        }
      }
    };

    const timer = setTimeout(() => { void loadReading(); }, 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [cardIds, mode, question, attempt]);

  const pageCount = mode === "five" ? 7 : 5;

  const moveWithButton = (direction: "previous" | "next") => {
    setActivePage((current) => getNavigationButtonTarget(current, direction, pageCount));
  };

  if (cardIds.length !== (mode === "five" ? 5 : 3) || !question.trim()) {
    return <Status>{mode === "five" ? "파이브카드와 카드 다섯 장" : "쓰리카드와 카드 세 장"}을 확인해주세요.</Status>;
  }
  if (errorMessage) {
    return <Status><p>{errorMessage}</p><button onClick={() => setAttempt((value) => value + 1)}>같은 카드로 다시 해설하기</button><Link href="/topic">질문 확인하기</Link></Status>;
  }
  if (!result) return <Status role="status" aria-live="polite" aria-busy="true"><p>당신의 질문에 맞춰<br />{mode === "five" ? "다섯" : "세"} 장의 이야기를 풀고 있어요.</p><small>카드의 의미와 상황을 함께 읽고 있어요.<br />화면을 나가지 않고 잠시 기다려주세요.</small></Status>;

  return (
    <Shell>
      <Header>
        <span>내 질문에 대한 답</span>
        <strong>{result.spreadTitle}</strong>
      </Header>

      <Viewport>
        <Track $page={activePage}>
          <Slide aria-hidden={activePage !== 0}>
            <SummaryCard>
              <Eyebrow>{mode === "five" ? "다섯" : "세"} 장이 전하는 답</Eyebrow>
              <h1>{result.conclusion}</h1>
              <Overview>{result.overview?.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</Overview>
              <FlowLine>{result.pages.map((page) => <span key={page.positionId}>{page.positionLabel}</span>)}</FlowLine>
            </SummaryCard>
          </Slide>

          {result.pages.map((page, index) => (
            <Slide key={page.positionId} aria-hidden={activePage !== index + 1}>
              <CardPage>
                <Position>{index + 1}번째 카드 · {page.positionLabel}</Position>
                <h2>{page.card.name_ko}</h2>
                <English>{page.card.name_en}</English>
                <CardImage>
                  <Image
                    src={`/cards/card${page.card.card_id}.webp`}
                    alt={`${page.positionLabel} 자리의 ${page.card.name_ko}`}
                    width={124}
                    height={207}
                    priority={index === 0}
                  />
                </CardImage>
                <RoleLabel>{page.positionLabel}</RoleLabel>
                <RoleDescription>{page.positionDescription}</RoleDescription>
                <Reading>
                  <strong>{page.headline}</strong>
                  <p>{page.summary}</p>
                  <p>{page.detail}</p>
                </Reading>
                <Question>{page.reflectionQuestion}</Question>
              </CardPage>
            </Slide>
          ))}
          <Slide aria-hidden={activePage !== pageCount - 1}>
            <SummaryCard>
              <Eyebrow>마지막으로, 지금 해볼 수 있는 일</Eyebrow>
              <Advice><span>카드들을 함께 읽은 조언</span><p>{result.advice}</p></Advice>
            </SummaryCard>
          </Slide>
        </Track>
      </Viewport>

      <Pager aria-label={`${mode === "five" ? "파이브카드" : "쓰리카드"} 결과 페이지`}>
        <NavButton type="button" disabled={activePage === 0} onClick={() => moveWithButton("previous")}>
          이전
        </NavButton>
        <Dots>
          {Array.from({ length: pageCount }, (_, index) => (
            <Dot
              key={index}
              aria-current={activePage === index ? "page" : undefined}
              $active={activePage === index}
            />
          ))}
        </Dots>
        {activePage === pageCount - 1 ? (
          <NavButton type="button" $home onClick={onHome}>홈으로</NavButton>
        ) : (
          <NavButton type="button" onClick={() => moveWithButton("next")}>{activePage === 0 ? "카드 해설" : "다음"}</NavButton>
        )}
      </Pager>
      <NavigationHint>아래 이전·다음 버튼으로 카드의 흐름을 확인하세요</NavigationHint>
    </Shell>
  );
}
