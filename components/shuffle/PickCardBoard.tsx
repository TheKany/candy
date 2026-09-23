import { usePickCardStoreSlotStore } from "@/store/usepickCardSlotStore";
import { useTarotTypeStore } from "@/store/useTarotTypeStore";
import { DEFAULT_THREE_CARD_SPREAD } from "@/constants/threeCardSpreads";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import CelticCrossPickBoard from "./CelticCrossPickBoard";
import { getRequiredCardCount } from "@/util/cardSelectionFlow";
import { FIVE_CARD_POSITIONS } from "@/constants/fiveCardPositions";
import { useMonthlyReadingStore } from "@/store/useMonthlyReadingStore";

type Props = {
  finishedShuffle: boolean;
};

const PickCardBoard = ({ finishedShuffle }: Props) => {
  const type = useTarotTypeStore((state) => state.type);
  const monthlyPeriod = useMonthlyReadingStore(state => state.period);
  const setSlotPosition = usePickCardStoreSlotStore(
    (state) => state.setSlotPosition
  );

  const slotRef = useRef<(HTMLDivElement | null)[]>([]);

  const [cardCount, setCardCount] = useState(0);
  const spreadOption = DEFAULT_THREE_CARD_SPREAD;
  const roleLabels = type === "five"
    ? FIVE_CARD_POSITIONS.map((position) => position.label)
    : type === "three"
      ? spreadOption?.positions.map((position) => position.label)
      : null;

  useEffect(() => {
    if (type !== null) {
      setCardCount(getRequiredCardCount(type, monthlyPeriod?.months.length));
    }
  }, [type, monthlyPeriod]);

  useEffect(() => {
    if (!finishedShuffle) return;

    const measure = () => slotRef.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setSlotPosition(i, {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: type === "monthly" ? el.parentElement!.getBoundingClientRect().width : undefined,
      });
    });
    measure();
    const observer = new ResizeObserver(measure);
    const container = slotRef.current[0]?.parentElement?.parentElement;
    if (container) observer.observe(container);
    return () => observer.disconnect();
  }, [finishedShuffle, cardCount, setSlotPosition, type]);

  if (type === "celtic") {
    return <CelticCrossPickBoard finishedShuffle={finishedShuffle} />;
  }

  return (
    <PickCardContainer $isFinish={finishedShuffle} $col={cardCount} $monthly={type === "monthly"}>
      {Array.from({ length: cardCount }).map((_, i) => (
        <PickCard key={i} aria-label={`선택한 카드 ${i + 1} 자리`}>
          <SlotLabel $overlap={type === "monthly" && cardCount >= 5}>{type === "monthly" ? `${monthlyPeriod?.months[i]}월` : type === "three" || type === "five" ? `${i + 1}번째 카드` : "선택한 카드"}</SlotLabel>
          <CardPosition
            ref={(el) => {
              slotRef.current[i] = el;
            }}
          />
          {roleLabels?.[i] && (
            <RoleLabel>{roleLabels[i]}</RoleLabel>
          )}
        </PickCard>
      ))}
    </PickCardContainer>
  );
};

export default PickCardBoard;

const PickCardContainer = styled.div<{ $isFinish: boolean; $col: number; $monthly: boolean }>`
  width: min(calc(100% - 32px), 340px);
  min-height: ${({ $col }) => ($col === 5 ? "264px" : $col === 3 ? "148px" : "124px")};
  margin: 4px auto 14px;
  display: grid;
  grid-template-columns: ${({ $col }) => $col === 5 ? "repeat(6, 1fr)" : `repeat(${$col}, 1fr)`};
  gap: 10px;
  position: relative;
  z-index: 1;

  opacity: ${({ $isFinish }) => ($isFinish ? 1 : 0)};
  visibility: ${({ $isFinish }) => ($isFinish ? "visible" : "hidden")};

  transition: opacity 0.5s ease-in-out, visibility 0.5s ease-in-out;

  & > div {
    grid-column: ${({ $col }) => $col === 5 ? "span 2" : "auto"};
  }

  & > div:nth-child(4) {
    grid-column: ${({ $col }) => $col === 5 ? "2 / span 2" : "auto"};
  }
  ${({ $monthly, $col }) => $monthly && `
    display:flex;
    justify-content:center;
    gap:${$col >= 5 ? "0" : "12px"};
    min-height:108px;
    height:108px;
    margin-bottom:8px;
    & > div {
      flex:none;
      width:min(50px, calc(200% / ${Math.max(1, $col + 1)}));
      border-radius:7px;
    }
    & > div + div { margin-left:${$col >= 5 ? `max(-25px, calc(-100% / ${$col + 1}))` : "0"}; }
    & > div > div { top:65px; }
  `}
`;

const PickCard = styled.div`
  width: 100%;
  min-width: 0;
  height: 100%;
  border: 1px dashed rgba(212, 175, 55, 0.75);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.035);
  position: relative;
`;

const CardPosition = styled.div`
  width: 1px;
  height: 1px;
  position: absolute;
  top: 54%;
  left: 50%;
`;

const SlotLabel = styled.span<{ $overlap?: boolean }>`
  position: absolute;
  top: 9px;
  left: ${({ $overlap }) => $overlap ? "0" : "50%"};
  width: ${({ $overlap }) => $overlap ? "50%" : "auto"};
  text-align:center;
  transform: ${({ $overlap }) => $overlap ? "none" : "translateX(-50%)"};
  color: rgba(212, 175, 55, 0.82);
  font-size: ${({ $overlap }) => $overlap ? "clamp(9px, 2.5vw, 11px)" : "clamp(9px, 3vw, 12px)"};
  white-space: nowrap;
`;

const RoleLabel = styled.strong`
  position: absolute;
  right: 3px;
  bottom: 7px;
  left: 3px;
  color: #f5d77e;
  font-size: clamp(9px, 3.1vw, 11px);
  line-height: 1.2;
  text-align: center;
  word-break: keep-all;
`;
