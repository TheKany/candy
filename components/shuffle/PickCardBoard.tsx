import { usePickCardStoreSlotStore } from "@/store/usepickCardSlotStore";
import { useTarotTypeStore } from "@/store/useTarotTypeStore";
import { useThreeCardSpreadStore } from "@/store/useThreeCardSpreadStore";
import { getThreeCardSpread } from "@/constants/threeCardSpreads";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

type Props = {
  finishedShuffle: boolean;
};

const getCardCountByType = (type: string | null) => {
  switch (type) {
    case "one":
      return 1;
    case "three":
      return 3;
    case "Yn":
      return 1;
    default:
      return 0;
  }
};

const PickCardBoard = ({ finishedShuffle }: Props) => {
  const type = useTarotTypeStore((state) => state.type);
  const spread = useThreeCardSpreadStore((state) => state.spread);
  const setSlotPosition = usePickCardStoreSlotStore(
    (state) => state.setSlotPosition
  );

  const slotRef = useRef<(HTMLDivElement | null)[]>([]);

  const [cardCount, setCardCount] = useState(0);
  const spreadOption = getThreeCardSpread(spread);

  useEffect(() => {
    if (type !== null) {
      setCardCount(getCardCountByType(type));
    }
  }, [type]);

  useEffect(() => {
    if (!finishedShuffle) return;

    slotRef.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setSlotPosition(i, {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
      });
    });
  }, [finishedShuffle]);

  return (
    <PickCardContainer $isFinish={finishedShuffle} $col={cardCount}>
      {Array.from({ length: cardCount }).map((_, i) => (
        <PickCard key={i} aria-label={`선택한 카드 ${i + 1} 자리`}>
          <SlotLabel>{type === "three" ? `${i + 1}번째 카드` : "선택한 카드"}</SlotLabel>
          <CardPosition
            ref={(el) => {
              slotRef.current[i] = el;
            }}
          />
          {type === "three" && spreadOption && (
            <RoleLabel>{spreadOption.positions[i].label}</RoleLabel>
          )}
        </PickCard>
      ))}
    </PickCardContainer>
  );
};

export default PickCardBoard;

const PickCardContainer = styled.div<{ $isFinish: boolean; $col: number }>`
  width: min(calc(100% - 32px), 340px);
  min-height: ${({ $col }) => ($col === 3 ? "148px" : "124px")};
  margin: 4px auto 14px;
  display: grid;
  grid-template-columns: repeat(${({ $col }) => $col}, 1fr);
  gap: 10px;
  position: relative;
  z-index: 1;

  opacity: ${({ $isFinish }) => ($isFinish ? 1 : 0)};
  visibility: ${({ $isFinish }) => ($isFinish ? "visible" : "hidden")};

  transition: opacity 0.5s ease-in-out, visibility 0.5s ease-in-out;
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

const SlotLabel = styled.span`
  position: absolute;
  top: 9px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(212, 175, 55, 0.82);
  font-size: clamp(9px, 3vw, 12px);
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
