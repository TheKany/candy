"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMonthlyReadingStore } from "@/store/useMonthlyReadingStore";
import { useUserPickNum } from "@/store/useUserPickNumStore";
import { requestMonthlyReading } from "@/util/readingTransport";
import { ReadingRequestError, type ReadingFailureCode } from "@/util/readingFailure";
import TartOvenStatus from "./TartOvenStatus";
import LuckClover from "./LuckClover";
import ReadingSaveButtons from "./ReadingSaveButtons";
import KakaoShareButton from "@/components/_common/KakaoShareButton";
import * as S from "./MonthlyReadingResult.styles";

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
  return <S.Shell>
    <S.Header><span>타로타르트 · {period.year} 월별 타로</span><h1>{page ? `${page.month}월의 이야기` : "나의 남은 달들"}</h1></S.Header>
    <S.Body ref={body} key={active ?? "overview"}>
      {page && card ? <>
        <S.Hero><Image src={`/cards/card${card.card_id}.webp`} alt={card.name_ko} width={108} height={180} />
          <p>{card.name_ko}</p><h2>{page.nickname}</h2><blockquote>{page.message}</blockquote></S.Hero>
        {categories.map(([key, title]) => <S.Category key={key}><h3>{title}</h3><p>{page[key]}</p></S.Category>)}
        <S.Luck><h3>{page.month}월의 행운 지수</h3><LuckClover value={page.luck} /><strong>{page.luck}%</strong><p>{page.luckMessage}</p><small>카드의 분위기를 담은 재미로 보는 지수예요.<br />실제 사건의 확률이나 정해진 미래는 아니에요.</small></S.Luck>
      </> : <>
        <p>{period.startMonth}월부터 12월까지, 한 달에 한 장.<br />카드를 눌러 그달의 이야기를 만나보세요.</p>
        <S.Grid>{result.pages.map((item, i) => <button type="button" key={item.month} onClick={() => setActive(i)} aria-label={`${item.month}월 해설 보기`}>
          <strong>{item.month}월</strong><Image src={`/cards/card${item.cardId}.webp`} alt="" width={66} height={110} />
          <b>{result.cards[i].name_ko}</b><span>{item.nickname}</span>
        </button>)}</S.Grid>
        <ReadingSaveButtons data={{ title: `${period.year}년 월별 타로`, sections: result.pages.flatMap((item, i) => [
          { title: `${item.month}월 · ${result.cards[i].name_ko}`, cardId: item.cardId, text: `${item.nickname}\n\n${item.message}` },
          ...categories.map(([key, title]) => ({ title: `${item.month}월 · ${title}`, text: item[key] })),
          { title: `${item.month}월 · 행운 지수 ${item.luck}%`, text: `${item.luckMessage}\n\n카드의 분위기를 담은 재미로 보는 지수예요. 실제 사건의 확률이나 정해진 미래는 아니에요.` },
        ]) }} />
        <KakaoShareButton />
      </>}
    </S.Body>
    <S.Footer>{active === null ? <button type="button" onClick={onHome}>홈으로</button> : <>
      <button type="button" disabled={active === 0} onClick={() => setActive(active - 1)}>이전 달</button>
      <button type="button" className="all" onClick={() => setActive(null)}>전체 달</button>
      <button type="button" disabled={active === result.pages.length - 1} onClick={() => setActive(active + 1)}>다음 달</button>
    </>}</S.Footer>
  </S.Shell>;
}
