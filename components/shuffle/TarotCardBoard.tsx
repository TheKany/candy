import { CARD_HEIGHT, CARD_WIDTH } from "@/constants/tarot";
import { usePickCardSlotStore } from "@/store/pickCardSlotStore";
import { usePickCard } from "@/store/pickCardStore";
import { useShuffleType } from "@/store/shuffleTypeStore";
import { Clockwise, Counterclockwise } from "@/styles/rotateAnimations";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import styled, { css } from "styled-components";

type Props = {
  isRotating: boolean;
  positions: {
    top: string;
    left: string;
    rotate: number;
  }[];
  cardCnt: number;
};

const TarotCardBoard = ({ isRotating, positions, cardCnt }: Props) => {
  const { slotPositions } = usePickCardSlotStore();
  const { pickedCardList } = usePickCard();
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { shuffleStep } = useShuffleType();

  useEffect(() => {
    if (!slotPositions.length) return;

    pickedCardList.forEach((cardIdx, order) => {
      const cardEl = cardRefs.current[cardIdx];
      const slotPos = slotPositions[order];

      if (!cardEl || !slotPos) return;

      const containerRect = cardEl.parentElement!.getBoundingClientRect();

      const targetTop = slotPos.top - containerRect.top;
      const targetLeft = slotPos.left - containerRect.left;

      if (slotPositions.length === 1) {
        cardEl.style.top = `${targetTop}px`;
        cardEl.style.left = `50%`;
        cardEl.style.transform = `translate(-50%, 0%) rotate(0deg)`;
        cardEl.style.transition = `top 0.6s ease, left 0.6s ease, transform 0.6s ease`;
        cardEl.style.zIndex = "10";
        return;
      }

      cardEl.style.top = `${targetTop}px`;
      cardEl.style.left = `${targetLeft}px`;
      cardEl.style.transform = `translate(0, 0) rotate(0deg)`;
      cardEl.style.transition = `top 0.6s ease, left 0.6s ease, transform 0.6s ease`;
      cardEl.style.zIndex = "10";
    });
  }, [pickedCardList, slotPositions]);

  return (
    <CardContainer>
      <Box $rotateWay={shuffleStep} $isRotating={isRotating}>
        {positions.length === cardCnt &&
          Array.from({ length: cardCnt }).map((_, index) => (
            <CardBox
              key={index}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              $positionT={positions[index].top}
              $positionL={positions[index].left}
              $rotate={positions[index].rotate}
              style={{ transitionDelay: `${(cardCnt - index) * 2}ms` }}
            >
              <Image
                src="/cardBack.png"
                alt="카드 뒷면"
                fill
                sizes={`${CARD_WIDTH}px`}
                priority
              />
            </CardBox>
          ))}
      </Box>
    </CardContainer>
  );
};

export default TarotCardBoard;

const CardContainer = styled.div`
  width: 300px;
  height: 300px;
  margin: 0 auto;
  padding-top: 100px;
  position: relative;
`;

const Box = styled.div<{
  $rotateWay: number | null;
  $isRotating: boolean;
}>`
  width: 100%;
  height: 100%;
  position: relative;
  transform-origin: center;
  ${({ $rotateWay, $isRotating }) =>
    $isRotating &&
    css`
      animation: ${$rotateWay === 1 ? Counterclockwise : Clockwise} 5s ease-out
        forwards;
    `}
`;

const CardBox = styled.div<{
  $positionT: string;
  $positionL: string;
  $rotate: number;
}>`
  width: ${CARD_WIDTH}px;
  height: ${CARD_HEIGHT}px;
  border: 2px solid #fff;
  position: absolute;
  top: ${({ $positionT }) => `${$positionT}`};
  left: ${({ $positionL }) => `${$positionL}`};
  transform: ${({ $rotate }) => `translate(-50%, -50%) rotate(${$rotate}deg)`};
  transform-origin: center center;
  transition: top 5s ease, left 5s ease, transform 5s ease;
  transition: ${({ $positionT, $positionL }) =>
    $positionL === "50%" && $positionT === "50%"
      ? "top 2s ease, left 2s ease, transform 2s ease"
      : "top 5s ease, left 5s ease, transform 5s ease"};
`;
