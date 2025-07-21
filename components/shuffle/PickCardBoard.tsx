import { usePickCardSlotStore } from "@/store/pickCardSlotStore";
import React, { useEffect, useRef } from "react";
import styled from "styled-components";

type Props = {
  finishedShuffle: boolean;
};

const PickCardBoard = ({ finishedShuffle }: Props) => {
  const { setSlotPosition } = usePickCardSlotStore();
  const slotRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!finishedShuffle) return;

    slotRef.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setSlotPosition(i, { top: rect.top, left: rect.left });
    });
  }, [finishedShuffle]);

  return (
    <PickCardContainer $isFinish={finishedShuffle}>
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
  );
};

export default PickCardBoard;

const PickCardContainer = styled.div<{ $isFinish: boolean }>`
  width: 100%;

  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
