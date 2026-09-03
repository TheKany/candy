"use client";

import { CELTIC_CROSS_POSITIONS } from "@/constants/celticCrossPositions";
import { getTarotTopic } from "@/constants/tarotTopics";
import { useCardOrientationStore } from "@/store/useCardOrientationStore";
import { useTarotTopicStore } from "@/store/useTarotTopicStore";
import { useUserPickNum } from "@/store/useUserPickNumStore";
import type { CelticCrossReadingResult } from "@/types/celticCrossReadingTypes";
import type { TarotOrientation } from "@/types/tarotReadingTypes";
import { getNavigationButtonTarget } from "@/util/horizontalResultPager";
import Image from "next/image";
import { useEffect, useState } from "react";
import styled from "styled-components";

type Props = { onHome: () => void };

const PAGE_COUNT = 12;
const OVERVIEW_POSITIONS = [
  [78, 104], [78, 104], [78, 34], [78, 174], [20, 104],
  [136, 104], [210, 190], [210, 138], [210, 86], [210, 34],
] as const;

const orientationLabel = (orientation: TarotOrientation) =>
  orientation === "upright" ? "정방향" : "역방향";

export default function CelticCrossResult({ onHome }: Props) {
  const cardIds = useUserPickNum((state) => state.realCard);
  const orientations = useCardOrientationStore((state) => state.orientations);
  const topicId = useTarotTopicStore((state) => state.topic);
  const topic = getTarotTopic(topicId);
  const [result, setResult] = useState<CelticCrossReadingResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    if (cardIds.length !== 10 || orientations.length !== 10 || !topicId) return;
    const controller = new AbortController();

    const loadReading = async () => {
      try {
        const params = new URLSearchParams({ topicId });
        cardIds.forEach((cardId) => params.append("cardId", cardId));
        orientations.forEach((orientation) => params.append("orientation", orientation));
        const response = await fetch(`/api/celticCrossReading?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Celtic Cross reading request failed");
        setResult((await response.json()) as CelticCrossReadingResult);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Celtic Cross reading request failed:", error);
          setErrorMessage("열 장의 메시지를 불러오지 못했어요. 카드를 다시 골라주세요.");
        }
      }
    };

    loadReading();
    return () => controller.abort();
  }, [cardIds, orientations, topicId]);

  const moveWithButton = (direction: "previous" | "next") => {
    setActivePage((current) => getNavigationButtonTarget(current, direction, PAGE_COUNT));
  };

  if (cardIds.length !== 10 || orientations.length !== 10 || !topic) {
    return <Status>켈틱 크로스 카드 열 장과 주제를 확인해주세요.</Status>;
  }
  if (errorMessage) {
    return (
      <Status>
        <p>{errorMessage}</p>
        <button type="button" onClick={() => history.back()}>카드 선택으로 돌아가기</button>
      </Status>
    );
  }
  if (!result) return <Status>열 장의 흐름을 연결하고 있어요.</Status>;

  return (
    <Shell>
      <Header>
        <span>{topic.title}</span>
        <strong>켈틱 크로스</strong>
      </Header>

      <Viewport>
        <Track $page={activePage}>
          <Slide aria-hidden={activePage !== 0}>
            <Overview>
              <Intro>
                <span>전체 배치</span>
                <h1>마음의 흐름을 한눈에 살펴보세요</h1>
              </Intro>
              <CrossBoard aria-label="선택한 켈틱 크로스 카드 열 장">
                {result.pages.map((page, index) => (
                  <OverviewSlot key={page.positionId} $index={index}>
                    <OverviewArtwork
                      $crossing={index === 1}
                      $reversed={page.orientation === "reversed"}
                    >
                      <Image
                        src={`/cards/card${page.card.card_id}.webp`}
                        alt=""
                        fill
                        sizes="46px"
                        priority={index < 2}
                      />
                    </OverviewArtwork>
                    <OverviewNumber>{index + 1}</OverviewNumber>
                    <DirectionMark>{page.orientation === "upright" ? "정" : "역"}</DirectionMark>
                  </OverviewSlot>
                ))}
              </CrossBoard>
              <Legend>
                {result.pages.map((page, index) => (
                  <li key={page.positionId}>
                    <b>{index + 1}</b>
                    <span>{page.positionLabel}</span>
                  </li>
                ))}
              </Legend>
            </Overview>
          </Slide>

          {result.pages.map((page, index) => (
            <Slide key={page.positionId} aria-hidden={activePage !== index + 1}>
              <CardPage>
                <Position>{index + 1}번째 카드 · {page.positionLabel}</Position>
                <h2>{page.card.name_ko}</h2>
                <English>{page.card.name_en}</English>
                <CardImage $reversed={page.orientation === "reversed"}>
                  <Image
                    src={`/cards/card${page.card.card_id}.webp`}
                    alt={`${page.positionLabel} 자리의 ${page.card.name_ko} ${orientationLabel(page.orientation)}`}
                    width={110}
                    height={183}
                    priority={index === 0}
                  />
                </CardImage>
                <Orientation $reversed={page.orientation === "reversed"}>
                  {orientationLabel(page.orientation)}
                </Orientation>
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

          <Slide aria-hidden={activePage !== PAGE_COUNT - 1}>
            <Synthesis>
              <Eyebrow>그래서, 켈틱 크로스의 결론은</Eyebrow>
              <h1>{result.conclusion}</h1>
              <Section><strong>지금의 핵심</strong><p>{result.coreConflict}</p></Section>
              <Section><strong>마음속 간극</strong><p>{result.innerGap}</p></Section>
              <Section><strong>시간의 흐름</strong><p>{result.timeline}</p></Section>
              <Section><strong>나와 주변의 영향</strong><p>{result.outerInfluence}</p></Section>
              <Advice><strong>마지막 조언</strong><p>{result.advice}</p></Advice>
            </Synthesis>
          </Slide>
        </Track>
      </Viewport>

      <Pager aria-label="켈틱 크로스 결과 페이지">
        <NavButton type="button" disabled={activePage === 0} onClick={() => moveWithButton("previous")}>
          이전
        </NavButton>
        <Dots aria-label={`${activePage + 1} / ${PAGE_COUNT} 페이지`}>
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
      <NavigationHint>아래 이전·다음 버튼으로 결과를 확인하세요</NavigationHint>
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
  padding: calc(10px + env(safe-area-inset-top)) 0 calc(7px + env(safe-area-inset-bottom));
  color: #fff7df;
  background: radial-gradient(circle at 18% 13%, rgb(226 184 85 / 18%), transparent 25%), linear-gradient(160deg, #08261d, #0c3427 50%, #061b15);
`;

const Header = styled.header`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 10px 7px;
  font-size: clamp(0.7rem, 3vw, 0.82rem);
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
  padding: 4px clamp(4px, 2vw, 12px) 10px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const Overview = styled.div`
  min-height: 100%;
  padding: 14px clamp(3px, 1.5vw, 12px);
  border: 1px solid rgb(231 202 112 / 52%);
  border-radius: 18px;
  background: linear-gradient(145deg, rgb(42 79 65 / 96%), rgb(18 52 41 / 98%));
`;

const Intro = styled.div`
  text-align: center;
  span { color: #f2ce72; font-size: 0.7rem; font-weight: 900; }
  h1 { margin: 5px 0 0; font-size: clamp(0.92rem, 4.5vw, 1.15rem); word-break: keep-all; }
`;

const CrossBoard = styled.div`
  position: relative;
  width: min(100%, 248px);
  height: 220px;
  margin: 8px auto 2px;
`;

const OverviewSlot = styled.div<{ $index: number }>`
  position: absolute;
  top: ${({ $index }) => OVERVIEW_POSITIONS[$index][1]}px;
  left: ${({ $index }) => OVERVIEW_POSITIONS[$index][0]}px;
  z-index: ${({ $index }) => ($index === 1 ? 2 : 1)};
  width: ${({ $index }) => ($index === 1 ? "46px" : "28px")};
  height: ${({ $index }) => ($index === 1 ? "28px" : "46px")};
  transform: translate(-50%, -50%);
`;

const OverviewArtwork = styled.div<{ $crossing: boolean; $reversed: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 28px;
  height: 46px;
  overflow: hidden;
  border: 1px solid #e4c668;
  border-radius: 3px;
  transform: translate(-50%, -50%) rotate(${({ $crossing, $reversed }) =>
    ($crossing ? 90 : 0) + ($reversed ? 180 : 0)}deg);
  img { object-fit: cover; }
`;

const OverviewNumber = styled.b`
  position: absolute;
  top: -5px;
  left: -5px;
  z-index: 2;
  display: grid;
  width: 15px;
  height: 15px;
  place-items: center;
  border-radius: 50%;
  color: #163b2e;
  background: #f2ce72;
  font-size: 8px;
`;

const DirectionMark = styled.span`
  position: absolute;
  right: -5px;
  bottom: -5px;
  z-index: 2;
  padding: 2px 3px;
  border-radius: 4px;
  color: #fff6dc;
  background: #173f31;
  font-size: 7px;
  font-weight: 800;
`;

const Legend = styled.ol`
  display: grid;
  margin: 0;
  padding: 0;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 5px 8px;
  list-style: none;
  li { display: flex; min-width: 0; align-items: center; gap: 5px; color: rgb(255 247 223 / 76%); font-size: clamp(0.58rem, 2.6vw, 0.7rem); }
  b { display: grid; width: 15px; height: 15px; flex: 0 0 15px; place-items: center; border-radius: 50%; color: #173f31; background: #f2ce72; font-size: 8px; }
  span { min-width: 0; word-break: keep-all; }
`;

const CardPage = styled.div`
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  padding: 8px clamp(9px, 4vw, 18px) 14px;
  text-align: center;
  h2 { margin: 5px 0 0; color: #fff6dc; font-size: clamp(1.12rem, 5.3vw, 1.48rem); }
`;

const Position = styled.span`
  color: #f2ce72;
  font-size: clamp(0.7rem, 3.1vw, 0.82rem);
  font-weight: 900;
`;

const English = styled.span`
  margin-top: 2px;
  color: rgb(255 247 223 / 62%);
  font-family: Georgia, serif;
  font-size: 0.7rem;
`;

const CardImage = styled.div<{ $reversed: boolean }>`
  width: clamp(72px, 27vw, 110px);
  margin-top: 7px;
  overflow: hidden;
  border: 2px solid #e4c668;
  border-radius: 7px;
  box-shadow: 0 9px 22px rgb(0 0 0 / 28%);
  img { display: block; width: 100%; height: auto; transform: rotate(${({ $reversed }) => $reversed ? 180 : 0}deg); }
`;

const Orientation = styled.span<{ $reversed: boolean }>`
  margin-top: 7px;
  padding: 3px 8px;
  border: 1px solid ${({ $reversed }) => $reversed ? "rgb(224 160 132 / 62%)" : "rgb(242 206 114 / 52%)"};
  border-radius: 999px;
  color: ${({ $reversed }) => $reversed ? "#f1b69d" : "#f2ce72"};
  font-size: 0.66rem;
  font-weight: 900;
`;

const RoleLabel = styled.strong`
  margin-top: 6px;
  color: #f2ce72;
  font-size: clamp(0.88rem, 4vw, 1.04rem);
`;

const RoleDescription = styled.span`
  margin-top: 2px;
  color: rgb(255 247 223 / 66%);
  font-size: clamp(0.65rem, 2.8vw, 0.78rem);
`;

const Reading = styled.div`
  width: 100%;
  margin-top: 10px;
  padding: 13px;
  border: 1px solid rgb(242 206 114 / 32%);
  border-radius: 13px;
  background: rgb(255 255 255 / 6%);
  text-align: left;
  strong { color: #fff0bd; font-size: clamp(0.8rem, 3.4vw, 0.94rem); }
  p { margin: 7px 0 0; color: rgb(255 247 223 / 86%); font-size: clamp(0.73rem, 3.1vw, 0.87rem); line-height: 1.62; word-break: keep-all; }
`;

const Question = styled.p`
  width: 100%;
  margin: 9px 0 0;
  padding: 11px;
  border-radius: 11px;
  color: #294d40;
  background: #fff2bb;
  font-size: clamp(0.7rem, 3vw, 0.82rem);
  font-weight: 700;
  line-height: 1.5;
  word-break: keep-all;
`;

const Synthesis = styled.div`
  min-height: 100%;
  padding: clamp(16px, 4vh, 28px) clamp(13px, 4vw, 22px);
  border: 1px solid rgb(231 202 112 / 58%);
  border-radius: 18px;
  background: linear-gradient(145deg, rgb(42 79 65 / 96%), rgb(18 52 41 / 98%));
  h1 { margin: 7px 0 15px; font-family: "NotoSerifKR", serif; font-size: clamp(1rem, 4.8vw, 1.34rem); line-height: 1.6; word-break: keep-all; }
`;

const Eyebrow = styled.span`
  color: #f2ce72;
  font-size: 0.72rem;
  font-weight: 900;
`;

const Section = styled.section`
  padding: 10px 0;
  border-top: 1px solid rgb(242 206 114 / 20%);
  strong { color: #f2ce72; font-size: 0.76rem; }
  p { margin: 5px 0 0; color: rgb(255 247 223 / 84%); font-size: clamp(0.74rem, 3.1vw, 0.88rem); line-height: 1.62; word-break: keep-all; }
`;

const Advice = styled.section`
  margin-top: 8px;
  padding: 13px;
  border-radius: 13px;
  color: #294d40;
  background: #fff2bb;
  strong { color: #80662c; font-size: 0.74rem; }
  p { margin: 6px 0 0; font-size: clamp(0.78rem, 3.3vw, 0.9rem); line-height: 1.62; word-break: keep-all; }
`;

const Pager = styled.nav`
  display: grid;
  min-width: 0;
  flex: 0 0 auto;
  grid-template-columns: 56px minmax(0, 1fr) 56px;
  align-items: center;
  gap: 4px;
  padding: 7px clamp(8px, 3vw, 15px) 0;
`;

const NavButton = styled.button<{ $home?: boolean }>`
  min-width: 0;
  min-height: 40px;
  border: 1px solid ${({ $home }) => $home ? "#ffe29a" : "rgb(242 206 114 / 48%)"};
  border-radius: 10px;
  color: ${({ $home }) => $home ? "#123a2b" : "#fff6dc"};
  background: ${({ $home }) => $home ? "#f2ce72" : "rgb(255 255 255 / 6%)"};
  font-size: 0.72rem;
  font-weight: 800;
  cursor: pointer;
  &:disabled { cursor: default; opacity: 0.28; }
`;

const Dots = styled.div`
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const Dot = styled.span<{ $active: boolean }>`
  display: block;
  width: ${({ $active }) => $active ? "13px" : "5px"};
  height: 5px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: ${({ $active }) => $active ? "#f2ce72" : "rgb(255 247 223 / 28%)"};
  transition: width 180ms ease;
`;

const NavigationHint = styled.p`
  flex: 0 0 auto;
  margin: 4px 0 0;
  color: rgb(255 247 223 / 52%);
  font-size: clamp(0.6rem, 2.6vw, 0.7rem);
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
