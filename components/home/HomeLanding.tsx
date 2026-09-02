"use client";

import { HOME_CONTENT } from "@/constants/homeContent";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

export default function HomeLanding() {
  return (
    <Main>
      <Eyebrow>{HOME_CONTENT.eyebrow}</Eyebrow>
      <Hero>
        <Artwork>
          <Image
            src="/main.png"
            alt="달과 별 타로 카드가 꽂힌 베리 타르트"
            width={1024}
            height={1024}
            priority
            sizes="(max-width: 430px) 76vw, 320px"
          />
        </Artwork>
        <Title>{HOME_CONTENT.title}</Title>
        <Description>{HOME_CONTENT.description}</Description>
      </Hero>
      <StartLink href={HOME_CONTENT.href}>
        {HOME_CONTENT.cta}<span aria-hidden>✦</span>
      </StartLink>
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
  overflow-y: auto;
  padding: calc(24px + env(safe-area-inset-top))
    calc(24px + env(safe-area-inset-right))
    calc(24px + env(safe-area-inset-bottom))
    calc(24px + env(safe-area-inset-left));
  color: #fff7df;
  background:
    radial-gradient(circle at 16% 13%, rgb(224 178 76 / 18%), transparent 24%),
    radial-gradient(circle at 82% 32%, rgb(105 160 113 / 17%), transparent 28%),
    linear-gradient(160deg, #08261d 0%, #0c3427 48%, #061b15 100%);

  &::before,
  &::after {
    position: absolute;
    z-index: 0;
    color: rgb(244 205 108 / 48%);
    pointer-events: none;
    content: "✦";
  }

  &::before {
    top: 18%;
    left: 9%;
    font-size: 0.8rem;
  }

  &::after {
    top: 12%;
    right: 11%;
    font-size: 1.1rem;
  }

  @media (max-width: 319px) {
    padding: calc(14px + env(safe-area-inset-top))
      calc(14px + env(safe-area-inset-right))
      calc(14px + env(safe-area-inset-bottom))
      calc(14px + env(safe-area-inset-left));
  }

  ${reducedMotion}
`;

const Eyebrow = styled.p`
  position: relative;
  z-index: 1;
  margin: 0;
  color: #f2ce72;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-align: center;
`;

const Hero = styled.section`
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(12px, 3vh, 24px);
  padding: clamp(18px, 5vh, 48px) 0;
  text-align: center;
`;

const Artwork = styled.div`
  width: clamp(176px, 72vw, 320px);
  aspect-ratio: 1;
  filter: drop-shadow(0 18px 25px rgb(0 0 0 / 32%));
  transition: transform 240ms ease;

  &:hover {
    transform: translateY(-4px);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @media (max-width: 319px) {
    width: min(68vw, 190px);
  }
`;

const Title = styled.h1`
  margin: 0;
  color: #fff6dc;
  font-family: "NotoSerifKR", serif;
  font-size: clamp(2rem, 12vw, 3rem);
  font-weight: 900;
  letter-spacing: -0.07em;
  line-height: 1.1;
  white-space: nowrap;
  text-shadow: 0 3px 20px rgb(0 0 0 / 28%);
`;

const Description = styled.p`
  max-width: 25ch;
  margin: 0;
  color: rgb(255 247 223 / 86%);
  font-size: clamp(0.92rem, 3.8vw, 1.05rem);
  line-height: 1.7;
  text-wrap: balance;
  word-break: keep-all;
`;

const StartLink = styled(Link)`
  position: relative;
  z-index: 1;
  display: flex;
  width: 100%;
  min-height: 52px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px solid rgb(255 239 169 / 70%);
  border-radius: 16px;
  color: #173629;
  background: linear-gradient(135deg, #f7da83, #d8a940 55%, #f3cb69);
  box-shadow: 0 10px 24px rgb(0 0 0 / 22%);
  font-size: 1.05rem;
  font-weight: 900;
  transition: transform 180ms ease, box-shadow 180ms ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 13px 28px rgb(0 0 0 / 28%);
  }

  &:focus-visible {
    outline: 3px solid #fff6dc;
    outline-offset: 4px;
  }

  span {
    font-size: 0.9em;
  }
`;
