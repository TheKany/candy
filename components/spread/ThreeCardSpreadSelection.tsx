"use client";

import { THREE_CARD_SPREADS } from "@/constants/threeCardSpreads";
import { useTarotTypeStore } from "@/store/useTarotTypeStore";
import { useThreeCardSpreadStore } from "@/store/useThreeCardSpreadStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styled from "styled-components";

export default function ThreeCardSpreadSelection() {
  const router = useRouter();
  const type = useTarotTypeStore((state) => state.type);
  const spread = useThreeCardSpreadStore((state) => state.spread);
  const setSpread = useThreeCardSpreadStore((state) => state.setSpread);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && type !== "three") router.replace("/select");
  }, [mounted, router, type]);

  if (!mounted || type !== "three") return null;

  return (
    <Main $selected={spread !== null}>
      <BackButton type="button" onClick={() => router.back()}>
        <span aria-hidden>←</span> 뒤로
      </BackButton>

      <Header>
        <Eyebrow>CHOOSE THREE CARD FLOW</Eyebrow>
        <h1>세 장을 어떻게 읽어볼까요?</h1>
        <p>질문에 가장 잘 맞는 흐름을 하나 골라주세요.</p>
      </Header>

      <SpreadList aria-label="쓰리카드 배열">
        {THREE_CARD_SPREADS.map((option) => {
          const isSelected = option.id === spread;
          return (
            <SpreadCard
              key={option.id}
              type="button"
              aria-pressed={isSelected}
              $selected={isSelected}
              onClick={() => setSpread(option.id)}
            >
              <Symbol aria-hidden>{option.symbol}</Symbol>
              <Copy>
                <strong>{option.title}</strong>
                <span>{option.subtitle}</span>
                <Positions>{option.positions.map(({ label }) => label).join(" · ")}</Positions>
              </Copy>
              {isSelected && <Check aria-hidden>✓</Check>}
            </SpreadCard>
          );
        })}
      </SpreadList>

      {spread && (
        <Dock>
          <ContinueButton type="button" onClick={() => router.push("/topic")}>
            이 배열로 계속하기 <span aria-hidden>→</span>
          </ContinueButton>
        </Dock>
      )}
    </Main>
  );
}

const Main = styled.main<{ $selected: boolean }>`
  min-height: 100dvh;
  padding: calc(18px + env(safe-area-inset-top))
    calc(18px + env(safe-area-inset-right))
    ${({ $selected }) => $selected ? "calc(106px + env(safe-area-inset-bottom))" : "calc(22px + env(safe-area-inset-bottom))"}
    calc(18px + env(safe-area-inset-left));
  color: #fff7df;
  background: radial-gradient(circle at 14% 15%, rgb(224 178 76 / 18%), transparent 24%),
    linear-gradient(160deg, #08261d, #0c3427 50%, #061b15);

  @media (max-width: 319px) {
    padding-right: calc(9px + env(safe-area-inset-right));
    padding-left: calc(9px + env(safe-area-inset-left));
  }
`;

const BackButton = styled.button`
  display: flex;
  min-height: 44px;
  align-items: center;
  gap: 6px;
  color: #fff6dc;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;

  span { color: #f2ce72; font-size: 1.3rem; }
`;

const Header = styled.header`
  margin: clamp(12px, 3vh, 24px) 0 18px;
  text-align: center;
  h1 { margin: 0; font-size: clamp(1.45rem, 7.3vw, 2rem); letter-spacing: -0.055em; word-break: keep-all; }
  p { margin: 9px 0 0; color: rgb(255 247 223 / 76%); font-size: clamp(0.8rem, 3.5vw, 0.94rem); }
`;

const Eyebrow = styled.div`
  margin-bottom: 8px;
  color: #f2ce72;
  font-family: Georgia, serif;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.14em;
`;

const SpreadList = styled.section`
  display: grid;
  gap: 10px;
`;

const SpreadCard = styled.button<{ $selected: boolean }>`
  position: relative;
  display: grid;
  min-width: 0;
  min-height: 104px;
  grid-template-columns: 42px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  padding: 15px 38px 15px 14px;
  border: 1px solid ${({ $selected }) => $selected ? "#f2ce72" : "rgb(242 206 114 / 34%)"};
  border-radius: 16px;
  color: #fff6dc;
  background: ${({ $selected }) => $selected ? "linear-gradient(145deg, #73591f, #174735)" : "rgb(12 55 41 / 92%)"};
  text-align: left;
  cursor: pointer;

  @media (max-width: 319px) {
    min-height: 98px;
    grid-template-columns: 32px minmax(0, 1fr);
    gap: 8px;
    padding-left: 10px;
  }
`;

const Symbol = styled.span`
  color: #f2ce72;
  font-family: Georgia, serif;
  font-size: 1.6rem;
  text-align: center;
`;

const Copy = styled.span`
  display: grid;
  min-width: 0;
  gap: 4px;
  strong { font-size: clamp(0.96rem, 4.2vw, 1.08rem); }
  & > span { color: rgb(255 247 223 / 70%); font-size: clamp(0.72rem, 3.1vw, 0.84rem); word-break: keep-all; }
`;

const Positions = styled.span`
  color: #f2ce72 !important;
  font-weight: 800;
  letter-spacing: -0.02em;
`;

const Check = styled.span`
  position: absolute;
  top: 10px;
  right: 10px;
  display: grid;
  width: 22px;
  height: 22px;
  place-items: center;
  border-radius: 50%;
  color: #123a2b;
  background: #f2ce72;
  font-weight: 900;
`;

const Dock = styled.div`
  position: fixed;
  z-index: 10;
  bottom: 0;
  left: 50%;
  width: min(100%, 480px);
  transform: translateX(-50%);
  padding: 14px calc(18px + env(safe-area-inset-right)) calc(14px + env(safe-area-inset-bottom)) calc(18px + env(safe-area-inset-left));
  background: linear-gradient(180deg, transparent, rgb(6 27 21 / 94%) 32%);
`;

const ContinueButton = styled.button`
  display: flex;
  width: 100%;
  min-height: 54px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 1px solid #ffe29a;
  border-radius: 15px;
  color: #123a2b;
  background: linear-gradient(135deg, #ffe49b, #e8bc57);
  font-size: clamp(0.92rem, 4vw, 1.04rem);
  font-weight: 900;
  cursor: pointer;
`;
