"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styled, { createGlobalStyle } from "styled-components";
import { useQuestionStore } from "@/store/useQuestionStore";
import { useUserPickNum } from "@/store/useUserPickNumStore";
import { useTarotTypeStore } from "@/store/useTarotTypeStore";
import { useReadingSessionStore } from "@/store/useReadingSessionStore";
import { handleResetCardProgress } from "@/util/handleResetStore";
import { loadPersonalReading } from "@/util/loadPersonalReading";
import type { TarotReadingResult } from "@/types/tarotReadingTypes";
import type { ThreeCardReadingResult } from "@/types/threeCardReadingTypes";
import KakaoShareButton from "@/components/_common/KakaoShareButton";
import Feedback from "./Feedback";
import ReadingSaveButtons from "./ReadingSaveButtons";
import TartOvenStatus from "./TartOvenStatus";
import { ReadingRequestError, type ReadingFailureCode } from "@/util/readingFailure";
import { Shell, Header, Viewport, Track, Slide, SummaryCard, Overview, Eyebrow, Advice, CardPage, Position, Reading, Pager, NavButton, NavigationHint, Status } from "./ResultPager.styles";

type ReadingResponse = (TarotReadingResult | ThreeCardReadingResult) & {
  followUpQuestions: string[];
  contextSummary: string;
};

export default function PersonalReadingResult({ mode, onHome }: { mode: "one" | "three" | "five"; onHome: () => void }) {
  const router = useRouter();
  const cardIds = useUserPickNum((state) => state.realCard);
  const question = useQuestionStore((state) => state.question);
  const deck = useReadingSessionStore((state) => state.deck);
  const usedPositions = useReadingSessionStore((state) => state.usedPositions);
  const [result, setResult] = useState<ReadingResponse | null>(null);
  const [error, setError] = useState<ReadingFailureCode | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [activePage, setActivePage] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const leaving = useRef(false);
  const count = mode === "one" ? 1 : mode === "three" ? 3 : 5;

  useEffect(() => {
    if (cardIds.length !== count || !question.trim()) return;
    const controller = new AbortController();
    setResult(null); setError(null); setRetrying(false); setActivePage(0); setSelectedQuestion("");
    const timer = setTimeout(() => {
      loadPersonalReading(mode, cardIds, controller.signal, () => { if (!controller.signal.aborted) setRetrying(true); })
        .then((value: ReadingResponse) => { if (!controller.signal.aborted) setResult(value); })
        .catch((reason: Error) => { if (!controller.signal.aborted) setError(reason instanceof ReadingRequestError ? reason.code : "unknown"); });
    }, 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [mode, count, cardIds, question, attempt]);

  if (cardIds.length !== count || !question.trim()) return <Status><p>질문과 선택한 카드를 확인해주세요.</p><Link href="/topic">질문으로 돌아가기</Link></Status>;
  if (error || !result) return <TartOvenStatus error={error} retrying={retrying} onRetry={() => setAttempt((value) => value + 1)} onHome={onHome} />;

  const single = "reading" in result ? result : null;
  const multi = "pages" in result ? result : null;
  const pages = multi?.pages ?? (single?.reading ? [{
    card: single.card, positionLabel: "한 장의 메시지", headline: single.reading.headline,
    summary: "", detail: single.reading.detail,
  }] : []);
  const conclusion = single?.reading?.summary ?? multi?.conclusion ?? "";
  const advice = single?.reading?.advice ?? multi?.advice ?? "";
  const followUpPage = pages.length + 1;
  const finishPage = followUpPage + 1;
  const pageCount = finishPage + 1;
  const stage = activePage === 0 ? "카드와 결론" : activePage < followUpPage ? "상세 해설" : activePage === followUpPage ? "추가 질문" : "상담 마무리";
  const canContinue = deck.length > usedPositions.length;

  const continueReading = () => {
    if (!selectedQuestion || leaving.current) return;
    const session = useReadingSessionStore.getState();
    if (!session.continueWith({ originalQuestion: session.previousConsultation?.originalQuestion ?? question, summary: result.contextSummary })) return;
    leaving.current = true;
    handleResetCardProgress();
    useQuestionStore.getState().save(selectedQuestion, null);
    useTarotTypeStore.getState().setType("one");
    router.replace("/shuffle");
  };

  return <>
    <ResultScreenStyle />
    <Shell>
      <Header><span>{mode === "one" ? "한 장" : mode === "three" ? "세 장" : "다섯 장"}의 이야기</span><strong>{stage}</strong></Header>
      <Viewport>
        <Track $page={activePage}>
          <Slide aria-hidden={activePage !== 0} inert={activePage !== 0}>
            <SummaryCard>
              <Eyebrow>뽑은 카드가 전하는 의미</Eyebrow>
              <CardMeanings>{pages.map((page) => <div key={page.card.card_id}>
                <Image src={`/cards/card${page.card.card_id}.webp`} alt={page.card.name_ko} width={42} height={70} />
                <div><strong>{page.card.name_ko}</strong><p>{page.card.upright_one_line || page.card.upright_keywords.slice(0, 3).join(" · ")}</p></div>
              </div>)}</CardMeanings>
              <Eyebrow>그래서, 질문에 대한 답은</Eyebrow>
              <h1>{conclusion}</h1>
            </SummaryCard>
          </Slide>
          {pages.map((page, index) => <Slide key={page.card.card_id} aria-hidden={activePage !== index + 1} inert={activePage !== index + 1}>
            <CardPage>
              <Position>{page.positionLabel} · {page.card.name_ko}</Position>
              <h2>{page.headline}</h2>
              {index === 0 && multi?.overview && <Overview style={{ marginTop: 18, textAlign: "left" }}>{multi.overview.map((text, i) => <p key={i}>{text}</p>)}</Overview>}
              <Reading>{page.summary && <p>{page.summary}</p>}{page.detail.split(/\n\s*\n/).filter(Boolean).map((text, i) => <p key={i}>{text}</p>)}</Reading>
              {index === pages.length - 1 && <Advice><span>지금 해볼 수 있는 일</span><p>{advice}</p></Advice>}
            </CardPage>
          </Slide>)}
          <Slide aria-hidden={activePage !== followUpPage} inert={activePage !== followUpPage}>
            <SummaryCard>
              <Eyebrow>이어서 궁금한 이야기</Eyebrow>
              <h1>조금 더 들여다볼까요?</h1>
              {canContinue ? <>
                <Intro>궁금한 질문 하나를 고르면, 섞지 않은 남은 카드에서 한 장을 더 뽑아요.</Intro>
                <Actions>{result.followUpQuestions.map((text) => <QuestionButton key={text} type="button" aria-pressed={selectedQuestion === text} $selected={selectedQuestion === text} onClick={() => setSelectedQuestion(text)}>{selectedQuestion === text ? "✓ " : ""}{text}</QuestionButton>)}</Actions>
                {selectedQuestion && <PrimaryButton type="button" onClick={continueReading}>남은 카드에서 한 장 뽑기</PrimaryButton>}
              </> : <Intro>{deck.length ? "남은 카드를 모두 살펴봤어요. 오늘의 이야기를 천천히 돌아보세요." : "이전 덱 정보가 없어 이어 뽑을 수 없어요. 새로운 상담에서 다시 만나요."}</Intro>}
              <Intro style={{ marginTop: 20 }}>여기서 마무리해도 좋아요. 아래 ‘마무리’ 버튼을 눌러주세요.</Intro>
            </SummaryCard>
          </Slide>
          <Slide aria-hidden={activePage !== finishPage} inert={activePage !== finishPage}>
            <SummaryCard>
              <Eyebrow>오늘의 타로타르트</Eyebrow>
              <h1>마음에 작은 도움이<br />되었기를 바라요.</h1>
              <Actions>
                <ReadingSaveButtons data={{ title: `${mode === "one" ? "한 장" : mode === "three" ? "세 장" : "다섯 장"}의 이야기`, question,
                  sections: [
                    { title: "종합 해설", text: [conclusion, ...(multi?.overview ?? [])].filter(Boolean).join("\n\n") },
                    ...pages.map(page => ({ title: `${page.positionLabel} · ${page.card.name_ko}`, cardId: page.card.card_id,
                      text: [page.card.upright_one_line || page.card.upright_keywords.join(" · "), page.headline, page.summary, page.detail].filter(Boolean).join("\n\n") })),
                    { title: "지금 해볼 수 있는 일", text: advice },
                    { title: "이어서 생각해볼 질문", text: result.followUpQuestions.join("\n\n") },
                  ] }} />
                <KakaoShareButton />
                <details><summary>피드백 쓰기</summary><Feedback /></details>
                <PrimaryButton type="button" onClick={onHome}>홈으로</PrimaryButton>
              </Actions>
            </SummaryCard>
          </Slide>
        </Track>
      </Viewport>
      <Pager aria-label="해설 페이지 이동">
        <NavButton disabled={activePage === 0} onClick={() => setActivePage((page) => Math.max(0, page - 1))}>이전</NavButton>
        <PageIndicator aria-live="polite">{stage}<br /><small>{activePage + 1} / {pageCount}</small></PageIndicator>
        <NavButton $home={activePage === finishPage} onClick={() => activePage === finishPage ? onHome() : setActivePage((page) => Math.min(finishPage, page + 1))}>{activePage === finishPage ? "홈으로" : activePage === followUpPage ? "마무리" : "다음"}</NavButton>
      </Pager>
      <NavigationHint>긴 해설은 안쪽에서 스크롤하고, 페이지는 버튼으로 넘겨요</NavigationHint>
    </Shell>
  </>;
}

const ResultScreenStyle = createGlobalStyle`body { padding-bottom: 0; overflow-y: hidden; }`;
const CardMeanings = styled.div`
  display: grid; gap: 10px; margin: 16px 0 24px;
  > div { display: flex; gap: 12px; align-items: center; min-width: 0; }
  img { border-radius: 4px; flex-shrink: 0; object-fit: cover; }
  strong { font-size: .9rem; } p { margin-top: 5px; color: #f2ce72; font-size: .78rem; line-height: 1.6; }
`;
const Intro = styled.p`font-size: .84rem; line-height: 1.7; color: #fff7dfb3; word-break: keep-all;`;
const Actions = styled.div`
  display: grid; gap: 12px; margin-top: 20px;
  > button, summary { width: 100%; min-height: 48px; padding: 14px; border: 1px solid #f2ce7270; border-radius: 12px; color: #fff7df; background: #ffffff08; cursor: pointer; font-size: .86rem; line-height: 1.6; }
  > button:disabled { opacity: .45; cursor: default; }
  button:focus-visible, summary:focus-visible { outline: 2px solid #f2ce72; outline-offset: 3px; }
`;
const QuestionButton = styled.button<{ $selected: boolean }>`
  && { text-align: left; border-color: ${({ $selected }) => $selected ? "#ffe49b" : "#f2ce7270"}; background: ${({ $selected }) => $selected ? "#f2ce7225" : "#ffffff08"}; }
`;
const PrimaryButton = styled.button`&& { width: 100%; min-height: 48px; margin-top: 16px; padding: 12px; border-radius: 12px; color: #123a2b; background: #f2ce72; font-weight: 700; cursor: pointer; line-height: 1.6; }`;
const PageIndicator = styled.span`text-align: center; color: #f2ce72; font-size: .78rem; line-height: 1.6; small { color: #fff7df90; }`;
