"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMonthlyReadingStore } from "@/store/useMonthlyReadingStore";
import { useUserPickNum } from "@/store/useUserPickNumStore";
import { requestMonthlyReading } from "@/util/readingTransport";
import { ReadingRequestError, type ReadingFailureCode } from "@/util/readingFailure";
import TartOvenStatus from "./TartOvenStatus";
import LuckClover from "./LuckClover";
import ReadingSaveButtons from "./ReadingSaveButtons";
import SaveToAccount from "@/components/account/SaveToAccount";
import { useReadingSessionStore } from "@/store/useReadingSessionStore";
import KakaoShareButton from "@/components/_common/KakaoShareButton";
import * as S from "./MonthlyReadingResult.styles";
import { ReadingCardPanel } from './ReadingPanels';

const categories = [["money", "금전"], ["work", "일 · 커리어 · 학업"], ["relationships", "인간관계"], ["wellbeing", "마음 · 일상"]] as const;

export default function MonthlyReadingResult({ onHome }: { onHome: () => void }) {
  const router = useRouter();
  const period = useMonthlyReadingStore(s => s.period);
  const result = useMonthlyReadingStore(s => s.result);
  const cardIds = useUserPickNum(s => s.realCard);
  const [active, setActive] = useState<number | null>(null);
  const [error, setError] = useState<ReadingFailureCode | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  const exportData = useMemo(() => !result || !period ? null : ({
    title: `${period.year}년 월별 타로`, keywords: [`${period.year}년`, "월별 흐름"],
    sections: result.pages.flatMap((item, i) => [
      { title: `${item.month}월 · ${result.cards[i].name_ko}`, cardId: item.cardId, text: `${item.nickname}\n\n${item.message}` },
      ...(item.remember?[{title:`기억할 것 · ${item.month}월 · ${result.cards[i].name_ko}`,text:item.remember}]:[]),
      ...(item.avoid?[{title:`주의할 것 · ${item.month}월 · ${result.cards[i].name_ko}`,text:item.avoid}]:[]),
      ...categories.map(([key, title]) => ({ title: `${item.month}월 · ${title}`, text: item[key] })),
      { title: `${item.month}월 · 행운 지수 ${item.luck}%`, text: `${item.luckMessage}\n\n카드의 분위기를 담은 재미로 보는 지수예요. 실제 사건의 확률이나 정해진 미래는 아니에요.` },
    ]),
  }), [result, period]);
  useEffect(() => {
    if (exportData) useReadingSessionStore.getState().remember({ id: JSON.stringify(["monthly", period, cardIds]), data: exportData });
  }, [exportData, period, cardIds]);

  useEffect(() => {
    if (!period || cardIds.length !== period.months.length) { router.replace("/select"); return; }
    if (result) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setError(null); setRetrying(attempt > 0);
      requestMonthlyReading({ year: period.year, startMonth: period.startMonth, cardIds: cardIds.map(Number) }, controller.signal, () => setRetrying(true))
        .then(value => { if (!controller.signal.aborted) useMonthlyReadingStore.getState().saveResult(value); })
        .catch(reason => { if (!controller.signal.aborted) setError(reason instanceof ReadingRequestError ? reason.code : "unknown"); });
    }, 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [period, cardIds, result, attempt, router]);

  useEffect(() => { if (body.current) body.current.scrollTop = 0; }, [active]);
  if (!period) return null;
  if (!result) return <TartOvenStatus variant="monthly" error={error} retrying={retrying} onRetry={() => setAttempt(n => n + 1)} onHome={onHome} />;
  const page = active === null ? null : result.pages[active];
  const card = active === null ? null : result.cards[active];
  const savePage = result.pages.length;
  const finishPage = savePage + 1;
  return <S.Shell>
    <S.Header><span>타로타르트 · {period.year} 월별 타로</span><h1>{active === savePage ? "이야기 간직하기" : active === finishPage ? "상담 마무리" : page ? `${page.month}월의 이야기` : "나의 남은 달들"}</h1></S.Header>
    <S.Body ref={body} key={active ?? "overview"}>
      {active === finishPage ? <>
        <S.Hero><h2>다음 이야기도<br />함께해요</h2><p>타로타르트와 함께한 시간, 어떠셨나요?<br />함께 보고 싶은 사람에게도 알려주세요.</p></S.Hero>
        <KakaoShareButton />
      </> : active === savePage ? <>
        <S.Hero><h2>오늘의 이야기를<br />간직해 보세요</h2></S.Hero>
        <SaveToAccount />
        {exportData && <ReadingSaveButtons data={exportData} onDownloaded={() => useReadingSessionStore.getState().markDownloaded(1)} />}
      </> : page && card ? <>
        <ReadingCardPanel card={{id:card.card_id,name:card.name_ko,label:`${page.month}월 · ${page.nickname}`,detail:page.message,remember:page.remember,avoid:page.avoid}}>
        {categories.map(([key, title]) => <S.Category key={key}><h3>{title}</h3><p>{page[key]}</p></S.Category>)}
        <S.Luck><h3>{page.month}월의 행운 지수</h3><LuckClover value={page.luck} /><strong>{page.luck}%</strong><p>{page.luckMessage}</p><small>카드의 분위기를 담은 재미로 보는 지수예요.<br />실제 사건의 확률이나 정해진 미래는 아니에요.</small></S.Luck>
        </ReadingCardPanel>
      </> : <>
        <p>{period.startMonth}월부터 12월까지, 한 달에 한 장.<br />카드를 눌러 그달의 이야기를 만나보세요.</p>
        <S.Grid>{result.pages.map((item, i) => <button type="button" key={item.month} onClick={() => setActive(i)} aria-label={`${item.month}월 해설 보기`}>
          <strong>{item.month}월</strong><Image src={`/cards/card${item.cardId}.webp`} alt="" width={66} height={110} />
          <b>{result.cards[i].name_ko}</b><span>{item.nickname}</span>
        </button>)}</S.Grid>
      </>}
    </S.Body>
    <S.Footer>{active === null ? <><button type="button" onClick={onHome}>홈으로</button><button type="button" onClick={() => setActive(savePage)}>이야기 간직하기</button></> : active >= savePage ? <>
      <button type="button" onClick={() => setActive(active === savePage ? null : savePage)}>이전</button>
      <button type="button" onClick={() => active === finishPage ? onHome() : setActive(finishPage)}>{active === finishPage ? "홈으로" : "다음"}</button>
    </> : <>
      <button type="button" disabled={active === 0} onClick={() => setActive(active - 1)}>이전 달</button>
      <button type="button" className="all" onClick={() => setActive(null)}>전체 달</button>
      <button type="button" onClick={() => setActive(active + 1)}>{active === result.pages.length - 1 ? "마무리" : "다음 달"}</button>
    </>}</S.Footer>
  </S.Shell>;
}
