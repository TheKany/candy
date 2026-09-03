import { CARD_HEIGHT, CARD_WIDTH, CENTER } from "@/constants/tarot";
import { usePickCardStoreSlotStore } from "@/store/usepickCardSlotStore";
import { useShuffleTypeStore } from "@/store/useShuffleTypeStore";
import { useUserPickNum } from "@/store/useUserPickNumStore";
import {
  getOrbitAnimationTiming,
  getOrganicOrbitMotion,
} from "@/util/organicShuffleMotion";
import { getRelativeSlotPosition } from "@/util/cardSelectionFlow";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import { useTarotTypeStore } from "@/store/useTarotTypeStore";
import { useCardOrientationStore } from "@/store/useCardOrientationStore";

type Props = {
  isRotating: boolean;
  positions: {
    top: string;
    left: string;
    rotate: number;
  }[];
  cardCnt: number;
  onOrbitComplete: () => void;
  onCardRevealComplete: () => void;
};

const TarotCardBoard = ({
  isRotating,
  positions,
  cardCnt,
  onOrbitComplete,
  onCardRevealComplete,
}: Props) => {
  const slotPositions = usePickCardStoreSlotStore(
    (state) => state.slotPositions
  );
  const userPickedCardList = useUserPickNum((state) => state.inputs);
  const realCardList = useUserPickNum((state) => state.realCard);
  const shuffleStep = useShuffleTypeStore((state) => state.shuffleStep);
  const type = useTarotTypeStore((state) => state.type);
  const orientations = useCardOrientationStore((state) => state.orientations);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const completedRevealIndexes = useRef(new Set<number>());
  const [revealedCardIndexes, setRevealedCardIndexes] = useState<Set<number>>(
    new Set()
  );

  const revealCard = (cardIndex: number) => {
    setRevealedCardIndexes((current) => {
      if (current.has(cardIndex)) return current;
      const next = new Set(current);
      next.add(cardIndex);
      return next;
    });
  };

  const completeReveal = (cardIndex: number) => {
    if (completedRevealIndexes.current.has(cardIndex)) return;
    completedRevealIndexes.current.add(cardIndex);
    onCardRevealComplete();
  };

  useEffect(() => {
    if (!slotPositions.length) return;

    userPickedCardList.forEach((cardIdx, order) => {
      const cardEl = cardRefs.current[Number(cardIdx) - 1];
      const slotPos = slotPositions[order];

      if (!cardEl || !slotPos) return;

      const containerRect = cardEl.parentElement!.getBoundingClientRect();
      const targetPosition = getRelativeSlotPosition(
        slotPos,
        { top: containerRect.top, left: containerRect.left },
        { x: window.scrollX, y: window.scrollY }
      );

      cardEl.style.top = `${targetPosition.top}px`;
      cardEl.style.left = `${targetPosition.left}px`;
      const targetTransform = type === "celtic"
        ? `translate(-50%, -50%) rotate(${order === 1 ? 90 : 0}deg) scale(0.55)`
        : "translate(-50%, -50%) rotate(0deg)";
      cardEl.style.transform = targetTransform;
      cardEl.style.transition = `top 0.72s cubic-bezier(0.22, 0.72, 0.28, 1), left 0.72s cubic-bezier(0.22, 0.72, 0.28, 1), transform 0.72s ease`;
      cardEl.style.transitionDelay = "0ms";
      cardEl.style.zIndex = String(20 + order);
    });
  }, [slotPositions, type, userPickedCardList]);

  return (
    <CardContainer>
      <Box>
        {positions.length === cardCnt &&
          Array.from({ length: cardCnt }).map((_, index) => {
            const pickedOrder = userPickedCardList.indexOf(String(index + 1));
            const frontCardId =
              pickedOrder >= 0 ? realCardList[pickedOrder] : undefined;
            const isPicked = pickedOrder >= 0;
            const isRevealed = revealedCardIndexes.has(index);

            return (
              <OrbitLayer
                key={index}
                $motion={getOrganicOrbitMotion(index, CENTER)}
                $shuffleStep={shuffleStep}
                $isRotating={isRotating}
                onAnimationEnd={
                  index === 0 && shuffleStep === 2
                    ? onOrbitComplete
                    : undefined
                }
              >
                <CardBox
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  $positionT={positions[index].top}
                  $positionL={positions[index].left}
                  $rotate={positions[index].rotate}
                  $motionIndex={index}
                  onTransitionEnd={(event) => {
                    if (
                      isPicked &&
                      event.propertyName === "top" &&
                      !isRevealed
                    ) {
                      revealCard(index);
                    }
                  }}
                >
                  <CardFlipper
                    $isRevealed={isRevealed}
                    onTransitionEnd={(event) => {
                      if (
                        isRevealed &&
                        event.propertyName === "transform"
                      ) {
                        completeReveal(index);
                      }
                    }}
                  >
                    <CardFace>
                      <Image
                        src="/cardBack.png"
                        alt="카드 뒷면"
                        fill
                        sizes={`${CARD_WIDTH}px`}
                        priority
                      />
                    </CardFace>
                    <CardFace
                      $isFront
                      $isReversed={type === "celtic" && orientations[pickedOrder] === "reversed"}
                    >
                      {frontCardId !== undefined && (
                        <Image
                          src={`/cards/card${Number(frontCardId)}.webp`}
                          alt="선택한 타로 카드 앞면"
                          fill
                          sizes={`${CARD_WIDTH}px`}
                        />
                      )}
                    </CardFace>
                  </CardFlipper>
                </CardBox>
              </OrbitLayer>
            );
          })}
      </Box>
      {shuffleStep === 4 && (
        <DeckRange aria-label="카드 위치는 왼쪽 1번부터 오른쪽 78번까지입니다">
          <span>1</span>
          <span>78</span>
        </DeckRange>
      )}
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

const Box = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 2;
`;

const ClockwiseOrbit = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const CounterclockwiseOrbit = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
`;

const OrbitLayer = styled.div<{
  $motion: ReturnType<typeof getOrganicOrbitMotion>;
  $shuffleStep: number | null;
  $isRotating: boolean;
}>`
  position: absolute;
  inset: 0;
  transform-origin: ${({ $motion }) =>
    `${$motion.axisX}px ${$motion.axisY}px`};
  pointer-events: none;

  ${({ $motion, $shuffleStep, $isRotating }) => {
    if (!$isRotating || ($shuffleStep !== 1 && $shuffleStep !== 2)) {
      return "";
    }

    const phaseDurationMs = $shuffleStep === 1 ? 5000 : 3000;
    const { durationMs, delayMs, easing } = getOrbitAnimationTiming(
      $motion,
      phaseDurationMs
    );

    return css`
      animation: ${$shuffleStep === 1
          ? CounterclockwiseOrbit
          : ClockwiseOrbit}
        ${durationMs}ms ${easing} ${delayMs}ms forwards;
    `;
  }}
`;

const CardBox = styled.div<{
  $positionT: string;
  $positionL: string;
  $rotate: number;
  $motionIndex: number;
}>`
  width: ${CARD_WIDTH}px;
  height: ${CARD_HEIGHT}px;
  position: absolute;
  top: ${({ $positionT }) => `${$positionT}`};
  left: ${({ $positionL }) => `${$positionL}`};
  transform: ${({ $rotate }) => `translate(-50%, -50%) rotate(${$rotate}deg)`};
  transform-origin: center center;
  transition: ${({ $positionT, $positionL, $motionIndex }) =>
    $positionL === "50%" && $positionT === "50%"
      ? "top 2s ease, left 2s ease, transform 2s ease"
      : `top ${2.65 + ($motionIndex % 7) * 0.025}s cubic-bezier(0.22, 0.7, 0.3, 1),
         left ${2.7 + ($motionIndex % 5) * 0.03}s cubic-bezier(0.2, 0.68, 0.28, 1),
         transform ${2.6 + ($motionIndex % 6) * 0.03}s cubic-bezier(0.24, 0.72, 0.32, 1)`};
  transition-delay: ${({ $motionIndex }) => ($motionIndex % 11) * 14}ms;
`;

const CardFlipper = styled.div<{ $isRevealed: boolean }>`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transform: rotateY(${({ $isRevealed }) => ($isRevealed ? 180 : 0)}deg);
  transition: transform 0.72s cubic-bezier(0.42, 0, 0.2, 1);
`;

const CardFace = styled.div<{ $isFront?: boolean; $isReversed?: boolean }>`
  position: absolute;
  inset: 0;
  overflow: hidden;
  border: 2px solid #fff;
  border-radius: 3px;
  backface-visibility: hidden;
  transform: ${({ $isFront, $isReversed }) =>
    $isFront
      ? `rotateY(180deg) rotateZ(${$isReversed ? 180 : 0}deg)`
      : "none"};
`;

const DeckRange = styled.div`
  position: absolute;
  top: 153px;
  left: 8px;
  right: 8px;
  display: flex;
  justify-content: space-between;
  color: #d4af37;
  font-size: 13px;
  font-weight: 700;
  pointer-events: none;
`;
