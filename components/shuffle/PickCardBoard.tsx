import { usePickCardSlotStore } from "@/store/pickCardSlotStore";
import { useTarotType } from "@/store/tarotTypeStore";
import React, { useEffect, useRef } from "react";
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
  const { type } = useTarotType();
  const { setSlotPosition } = usePickCardSlotStore();
  const slotRef = useRef<(HTMLDivElement | null)[]>([]);

  const cardCount = getCardCountByType(type);

  useEffect(() => {
    if (!finishedShuffle) return;

    slotRef.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setSlotPosition(i, { top: rect.top, left: rect.left });
    });
  }, [finishedShuffle]);

  return (
    <>
      {type === "one" ? (
        <PickCardContainer $isFinish={finishedShuffle} $col={cardCount}>
          {[0].map((_, i) => (
            <PickCard key={i}>
              <CardPosition
                ref={(el) => {
                  slotRef.current[i] = el;
                }}
              ></CardPosition>
            </PickCard>
          ))}
        </PickCardContainer>
      ) : (
        <PickCardContainer $isFinish={finishedShuffle} $col={cardCount}>
          {[0, 1, 2].map((_, i) => (
            <PickCard key={i}>
              <CardPosition
                ref={(el) => {
                  slotRef.current[i] = el;
                }}
              ></CardPosition>
            </PickCard>
          ))}
        </PickCardContainer>
      )}
    </>
  );
};

export default PickCardBoard;

const PickCardContainer = styled.div<{ $isFinish: boolean; $col: number }>`
  width: 100%;

  display: grid;
  grid-template-columns: repeat(${({ $col }) => $col}, 1fr);
  gap: 8px;
  height: 100px;
  position: absolute;
  top: 40%;

  opacity: ${({ $isFinish }) => ($isFinish ? 1 : 0)};
  visibility: ${({ $isFinish }) => ($isFinish ? "visible" : "hidden")};

  transition: opacity 0.5s ease-in-out, visibility 0.5s ease-in-out;
`;

const PickCard = styled.div`
  width: 100%;
  height: 100%;
  border: 1px solid #d4af37;
  padding: 6px 30%;
`;

const CardPosition = styled.div`
  width: 10px;
  height: 10px;
`;
