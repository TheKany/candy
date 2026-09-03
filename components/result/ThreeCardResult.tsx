"use client";

import { getTarotTopic } from "@/constants/tarotTopics";
import { useTarotTopicStore } from "@/store/useTarotTopicStore";
import { useThreeCardSpreadStore } from "@/store/useThreeCardSpreadStore";
import { useUserPickNum } from "@/store/useUserPickNumStore";
import type { ThreeCardReadingResult } from "@/types/threeCardReadingTypes";
import { getNavigationButtonTarget } from "@/util/horizontalResultPager";
import Image from "next/image";
import { useEffect, useState } from "react";
import styled from "styled-components";

type Props = { onHome: () => void };

const PAGE_COUNT = 4;

export default function ThreeCardResult({ onHome }: Props) {
  const cardIds = useUserPickNum((state) => state.realCard);
  const topicId = useTarotTopicStore((state) => state.topic);
  const spreadId = useThreeCardSpreadStore((state) => state.spread);
  const topic = getTarotTopic(topicId);
  const [result, setResult] = useState<ThreeCardReadingResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    if (cardIds.length !== 3 || !topicId || !spreadId) return;
    const controller = new AbortController();

    const loadReading = async () => {
      try {
        const params = new URLSearchParams({
          topicId,
          spreadId,
          orientation: "upright",
        });
        cardIds.forEach((cardId) => params.append("cardId", cardId));
        const response = await fetch(`/api/threeCardReading?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("three-card reading request failed");
        setResult((await response.json()) as ThreeCardReadingResult);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Three-card reading request failed:", error);
          setErrorMessage("세 장의 메시지를 불러오지 못했어요. 카드를 다시 골라주세요.");
        }
      }
    };

    loadReading();
    return () => controller.abort();
  }, [cardIds, spreadId, topicId]);

  const moveWithButton = (direction: "previous" | "next") => {
    setActivePage((current) => getNavigationButtonTarget(current, direction, PAGE_COUNT));
  };

  if (cardIds.length !== 3 || !topic || !spreadId) {
    return <Status>쓰리카드 배열과 카드 세 장을 확인해주세요.</Status>;
  }
  if (errorMessage) {
    return <Status><p>{errorMessage}</p><button onClick={() => history.back()}>카드 선택으로 돌아가기</button></Status>;
  }
  if (!result) return <Status>세 장의 흐름을 연결하고 있어요.</Status>;

  return (
    <Shell>
      <Header>
        <span>{topic.title}</span>
        <strong>{result.spreadTitle}</strong>
      </Header>

      <Viewport>
        <Track $page={activePage}>
          <Slide aria-hidden={activePage !== 0}>
            <SummaryCard>
              <Eyebrow>그래서, 세 장의 결론은</Eyebrow>
              <h1>{result.conclusion}</h1>
              <FlowLine>{result.flowSummary}</FlowLine>
              <Advice>
                <span>마지막 조언</span>
                <p>{result.advice}</p>
              </Advice>
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
        </Track>
      </Viewport>

      <Pager aria-label="쓰리카드 결과 페이지">
        <NavButton type="button" disabled={activePage === 0} onClick={() => moveWithButton("previous")}>
          이전
        </NavButton>
        <Dots>
          {Array.from({ length: PAGE_COUNT }, (_, index) => (
            <Dot
              key={index}
              aria-current={activePage === index ? "page" : undefined}
              $active={activePage === index}
            />
          ))}
        </Dots>
        {activePage === PAGE_COUNT - 1 ? (
          <NavButton type="button" $home onClick={onHome}>홈으로</NavButton>
        ) : (
          <NavButton type="button" onClick={() => moveWithButton("next")}>다음</NavButton>
        )}
      </Pager>
      <NavigationHint>아래 이전·다음 버튼으로 카드의 흐름을 확인하세요</NavigationHint>
    </Shell>
  );
}

const Shell = styled.section`
  display: flex;
  width: min(100%, 480px);
  height: 100dvh;
  min-height: 520px;
  margin: 0 auto;
  flex-direction: column;
  overflow: hidden;
  padding: calc(12px + env(safe-area-inset-top)) 0 calc(8px + env(safe-area-inset-bottom));
  color: #fff7df;
  background: radial-gradient(circle at 18% 13%, rgb(226 184 85 / 18%), transparent 25%), linear-gradient(160deg, #08261d, #0c3427 50%, #061b15);
`;

const Header = styled.header`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 12px 8px;
  font-size: clamp(0.72rem, 3vw, 0.84rem);
  span { color: rgb(255 247 223 / 70%); }
  strong { color: #f2ce72; }
`;

const Viewport = styled.div`
  min-height: 0;
  flex: 1;
  overflow: hidden;
`;

const Track = styled.div<{ $page: number }>`
  display: flex;
  width: 100%;
  height: 100%;
  transform: translateX(-${({ $page }) => $page * 100}%);
  transition: transform 360ms cubic-bezier(0.22, 0.7, 0.28, 1);

  @media (prefers-reduced-motion: reduce) { transition: none; }
`;

const Slide = styled.article`
  width: 100%;
  min-width: 100%;
  min-height: 0;
  overflow-y: auto;
  padding: 4px clamp(10px, 5vw, 22px) 10px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const SummaryCard = styled.div`
  display: flex;
  min-height: 100%;
  flex-direction: column;
  justify-content: center;
  padding: clamp(18px, 5vh, 34px) clamp(14px, 5vw, 24px);
  border: 1px solid rgb(231 202 112 / 65%);
  border-radius: 20px;
  background: linear-gradient(145deg, rgb(42 79 65 / 96%), rgb(18 52 41 / 98%));
  box-shadow: 0 14px 34px rgb(0 0 0 / 24%);
  h1 { margin: 9px 0 18px; font-family: "NotoSerifKR", serif; font-size: clamp(1.05rem, 5.5vw, 1.42rem); line-height: 1.65; word-break: keep-all; }
`;

const Eyebrow = styled.span`
  color: #f2ce72;
  font-size: 0.76rem;
  font-weight: 900;
`;

const FlowLine = styled.p`
  margin: 0;
  color: #f5d77e;
  font-size: clamp(0.72rem, 3.2vw, 0.86rem);
  font-weight: 800;
  line-height: 1.6;
  text-align: center;
  word-break: keep-all;
`;

const Advice = styled.div`
  margin-top: clamp(18px, 4vh, 28px);
  padding: 17px 15px;
  border-radius: 15px;
  color: #294d40;
  background: #fff2bb;
  span { color: #80662c; font-size: 0.72rem; font-weight: 900; }
  p { margin: 7px 0 0; font-size: clamp(0.84rem, 3.5vw, 0.96rem); line-height: 1.7; word-break: keep-all; }
`;

const CardPage = styled.div`
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  padding: 10px clamp(10px, 4vw, 18px) 16px;
  text-align: center;
  h2 { margin: 6px 0 0; color: #fff6dc; font-size: clamp(1.2rem, 5.5vw, 1.55rem); }
`;

const Position = styled.span`
  color: #f2ce72;
  font-size: clamp(0.72rem, 3.2vw, 0.84rem);
  font-weight: 900;
`;

const English = styled.span`
  margin-top: 2px;
  color: rgb(255 247 223 / 62%);
  font-family: Georgia, serif;
  font-size: 0.72rem;
`;

const CardImage = styled.div`
  width: clamp(82px, 31vw, 124px);
  margin-top: 8px;
  overflow: hidden;
  border: 2px solid #e4c668;
  border-radius: 8px;
  box-shadow: 0 10px 24px rgb(0 0 0 / 28%);
  img { display: block; width: 100%; height: auto; }
`;

const RoleLabel = styled.strong`
  margin-top: 8px;
  color: #f2ce72;
  font-size: clamp(0.92rem, 4.2vw, 1.08rem);
`;

const RoleDescription = styled.span`
  margin-top: 2px;
  color: rgb(255 247 223 / 66%);
  font-size: clamp(0.68rem, 2.9vw, 0.8rem);
`;

const Reading = styled.div`
  width: 100%;
  margin-top: 12px;
  padding: 15px 14px;
  border: 1px solid rgb(242 206 114 / 32%);
  border-radius: 14px;
  background: rgb(255 255 255 / 6%);
  text-align: left;
  strong { color: #fff0bd; font-size: clamp(0.84rem, 3.5vw, 0.96rem); }
  p { margin: 8px 0 0; color: rgb(255 247 223 / 86%); font-size: clamp(0.76rem, 3.2vw, 0.9rem); line-height: 1.65; word-break: keep-all; }
`;

const Question = styled.p`
  width: 100%;
  margin: 10px 0 0;
  padding: 12px;
  border-radius: 12px;
  color: #294d40;
  background: #fff2bb;
  font-size: clamp(0.72rem, 3.1vw, 0.84rem);
  font-weight: 700;
  line-height: 1.55;
  word-break: keep-all;
`;

const Pager = styled.nav`
  display: grid;
  min-width: 0;
  flex: 0 0 auto;
  grid-template-columns: 64px minmax(0, 1fr) 64px;
  align-items: center;
  gap: 6px;
  padding: 8px clamp(10px, 4vw, 18px) 0;
`;

const NavButton = styled.button<{ $home?: boolean }>`
  min-width: 0;
  min-height: 40px;
  border: 1px solid ${({ $home }) => $home ? "#ffe29a" : "rgb(242 206 114 / 48%)"};
  border-radius: 11px;
  color: ${({ $home }) => $home ? "#123a2b" : "#fff6dc"};
  background: ${({ $home }) => $home ? "#f2ce72" : "rgb(255 255 255 / 6%)"};
  font-size: 0.76rem;
  font-weight: 800;
  cursor: pointer;
  &:disabled { cursor: default; opacity: 0.28; }
`;

const Dots = styled.div`
  display: flex;
  min-width: 0;
  justify-content: center;
  gap: 8px;
`;

const Dot = styled.span<{ $active: boolean }>`
  display: block;
  width: ${({ $active }) => $active ? "20px" : "8px"};
  height: 8px;
  border-radius: 999px;
  background: ${({ $active }) => $active ? "#f2ce72" : "rgb(255 247 223 / 30%)"};
  transition: width 180ms ease;
`;

const NavigationHint = styled.p`
  flex: 0 0 auto;
  margin: 5px 0 0;
  color: rgb(255 247 223 / 52%);
  font-size: clamp(0.62rem, 2.7vw, 0.72rem);
  text-align: center;
`;

const Status = styled.div`
  display: grid;
  min-height: 100dvh;
  place-content: center;
  gap: 14px;
  padding: 24px;
  color: #fff6dc;
  background: #08261d;
  text-align: center;
  button { min-height: 44px; padding: 0 16px; border-radius: 12px; color: #123a2b; background: #f2ce72; font-weight: 800; }
`;
