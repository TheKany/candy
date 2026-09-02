"use client";

import {
  getTopicSelectionAction,
  TAROT_TOPICS,
} from "@/constants/tarotTopics";
import { useTarotTopicStore } from "@/store/useTarotTopicStore";
import { useTarotTypeStore } from "@/store/useTarotTypeStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styled, { css, keyframes } from "styled-components";

export default function TopicSelection() {
  const router = useRouter();
  const type = useTarotTypeStore((state) => state.type);
  const topic = useTarotTopicStore((state) => state.topic);
  const setTopic = useTarotTopicStore((state) => state.setTopic);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && !type) router.replace("/select");
  }, [mounted, router, type]);

  const continueToShuffle = () => {
    const action = getTopicSelectionAction(topic);

    if (action.kind === "navigate") router.push(action.href);
  };

  if (!mounted || !type) return null;

  return (
    <Main $hasSelection={topic !== null}>
      <TopBar>
        <BackButton
          type="button"
          aria-label="타로 유형 선택 화면으로 돌아가기"
          onClick={() => router.back()}
        >
          <span aria-hidden>←</span>
          뒤로
        </BackButton>
      </TopBar>

      <Header>
        <Eyebrow>CHOOSE YOUR CONCERN</Eyebrow>
        <Title>무엇이 가장 궁금한가요?</Title>
        <Description>지금 마음에 가장 가까운 주제를 하나 골라주세요.</Description>
      </Header>

      <TopicGrid aria-label="타로 고민 주제">
        {TAROT_TOPICS.map((option) => {
          const selected = option.id === topic;

          return (
            <TopicCard
              key={option.id}
              type="button"
              aria-pressed={selected}
              $selected={selected}
              onClick={() => setTopic(option.id)}
            >
              <Symbol aria-hidden>{option.symbol}</Symbol>
              <TopicTitle>{option.title}</TopicTitle>
              {selected && <Check aria-hidden>✓</Check>}
            </TopicCard>
          );
        })}
      </TopicGrid>

      {topic && (
        <CtaDock>
          <ContinueButton type="button" onClick={continueToShuffle}>
            이 주제로 타로 보기
            <span aria-hidden>→</span>
          </ContinueButton>
        </CtaDock>
      )}
    </Main>
  );
}

const dockEnter = keyframes`
  from { opacity: 0; transform: translate(-50%, 12px); }
  to { opacity: 1; transform: translate(-50%, 0); }
`;

const reducedMotion = css`
  @media (prefers-reduced-motion: reduce) {
    &, &::before, &::after, * {
      scroll-behavior: auto !important;
      transition: none !important;
      animation: none !important;
    }
  }
`;

const Main = styled.main<{ $hasSelection: boolean }>`
  position: relative;
  width: 100%;
  min-height: 100dvh;
  padding: calc(18px + env(safe-area-inset-top))
    calc(20px + env(safe-area-inset-right))
    ${({ $hasSelection }) =>
      $hasSelection
        ? "calc(112px + env(safe-area-inset-bottom))"
        : "calc(22px + env(safe-area-inset-bottom))"}
    calc(20px + env(safe-area-inset-left));
  color: #fff7df;
  background:
    radial-gradient(circle at 14% 16%, rgb(224 178 76 / 18%), transparent 23%),
    radial-gradient(circle at 90% 72%, rgb(105 160 113 / 15%), transparent 25%),
    linear-gradient(160deg, #08261d 0%, #0c3427 48%, #061b15 100%);

  &::before,
  &::after {
    position: absolute;
    color: rgb(244 205 108 / 42%);
    pointer-events: none;
    content: "✦";
  }

  &::before {
    top: 18%;
    left: 7%;
    font-size: 0.7rem;
  }

  &::after {
    right: 7%;
    bottom: 24%;
    font-size: 0.9rem;
  }

  @media (max-width: 319px) {
    padding-right: calc(10px + env(safe-area-inset-right));
    padding-left: calc(10px + env(safe-area-inset-left));
  }

  ${reducedMotion}
`;

const TopBar = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 44px;
  align-items: center;
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

const Header = styled.header`
  position: relative;
  z-index: 1;
  margin: clamp(14px, 4vh, 30px) 0 clamp(18px, 4vh, 28px);
  text-align: center;
`;

const Eyebrow = styled.p`
  margin: 0 0 9px;
  color: #f2ce72;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.16em;
`;

const Title = styled.h1`
  margin: 0;
  color: #fff6dc;
  font-size: clamp(1.5rem, 7.4vw, 2.05rem);
  font-weight: 900;
  letter-spacing: -0.055em;
  line-height: 1.22;
  word-break: keep-all;
`;

const Description = styled.p`
  max-width: 27ch;
  margin: 10px auto 0;
  color: rgb(255 247 223 / 78%);
  font-size: clamp(0.78rem, 3.4vw, 0.94rem);
  line-height: 1.55;
  word-break: keep-all;
`;

const TopicGrid = styled.section`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(8px, 2.6vw, 12px);
`;

const TopicCard = styled.button<{ $selected: boolean }>`
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 98px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 8px;
  border: 1px solid
    ${({ $selected }) => ($selected ? "#f2ce72" : "rgb(242 206 114 / 38%)")};
  border-radius: 16px;
  color: #fff6dc;
  background: ${({ $selected }) =>
    $selected
      ? "linear-gradient(145deg, rgb(116 88 29 / 74%), rgb(21 70 51 / 98%))"
      : "linear-gradient(145deg, rgb(24 75 56 / 91%), rgb(8 42 32 / 94%))"};
  box-shadow: ${({ $selected }) =>
    $selected
      ? "0 10px 24px rgb(0 0 0 / 24%), inset 0 0 0 2px rgb(255 239 184 / 14%)"
      : "0 8px 18px rgb(0 0 0 / 16%), inset 0 1px 0 rgb(255 247 223 / 7%)"};
  cursor: pointer;
  transition: transform 180ms ease, border-color 180ms ease,
    background 180ms ease, box-shadow 180ms ease;

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: 3px solid #fff6dc;
    outline-offset: -4px;
  }

  @media (max-width: 319px) {
    min-height: 92px;
    padding: 12px 5px;
    border-radius: 14px;
  }
`;

const Symbol = styled.span`
  color: #f2ce72;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(1.3rem, 6.4vw, 1.7rem);
  line-height: 1;
`;

const TopicTitle = styled.span`
  color: #fff6dc;
  font-size: clamp(0.82rem, 3.6vw, 1rem);
  font-weight: 800;
  line-height: 1.25;
  word-break: keep-all;
`;

const Check = styled.span`
  position: absolute;
  top: 8px;
  right: 8px;
  display: grid;
  width: 22px;
  height: 22px;
  place-items: center;
  border-radius: 50%;
  color: #123a2b;
  background: #f2ce72;
  box-shadow: 0 2px 8px rgb(0 0 0 / 28%);
  font-size: 0.76rem;
  font-weight: 900;
`;

const CtaDock = styled.div`
  position: fixed;
  z-index: 10;
  bottom: 0;
  left: 50%;
  width: min(100%, 480px);
  transform: translateX(-50%);
  padding: 14px calc(20px + env(safe-area-inset-right))
    calc(14px + env(safe-area-inset-bottom))
    calc(20px + env(safe-area-inset-left));
  background: linear-gradient(180deg, transparent, rgb(6 27 21 / 92%) 32%);
  animation: ${dockEnter} 220ms ease-out both;

  @media (max-width: 319px) {
    padding-right: calc(10px + env(safe-area-inset-right));
    padding-left: calc(10px + env(safe-area-inset-left));
  }
`;

const ContinueButton = styled.button`
  display: flex;
  width: 100%;
  min-height: 54px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px solid #ffe29a;
  border-radius: 15px;
  color: #123a2b;
  background: linear-gradient(135deg, #ffe49b, #e8bc57);
  box-shadow: 0 10px 28px rgb(0 0 0 / 30%);
  cursor: pointer;
  font-size: clamp(0.95rem, 4vw, 1.06rem);
  font-weight: 900;

  span {
    font-size: 1.22rem;
  }

  &:active {
    transform: scale(0.99);
  }

  &:focus-visible {
    outline: 3px solid #fff6dc;
    outline-offset: -4px;
  }
`;
