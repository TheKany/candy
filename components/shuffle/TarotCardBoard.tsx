import { CARD_HEIGHT, CARD_WIDTH, CENTER } from "@/constants/tarot";
import { usePickCardStoreSlotStore } from "@/store/usepickCardSlotStore";
import { useShuffleTypeStore } from "@/store/useShuffleTypeStore";
import { useUserPickNum } from "@/store/useUserPickNumStore";
import {
  getOrbitAnimationTiming,
  getOrganicOrbitMotion,
  SHUFFLE_TIME_SCALE,
} from "@/util/organicShuffleMotion";
import { getRelativeSlotPosition } from "@/util/cardSelectionFlow";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import { useTarotTypeStore } from "@/store/useTarotTypeStore";
import { useCardOrientationStore } from "@/store/useCardOrientationStore";
import { useReadingSessionStore } from "@/store/useReadingSessionStore";

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
  browsingEnabled: boolean;
  browsedPosition: number | null;
  onBrowse: (position: number) => void;
};

const TarotCardBoard = ({
  isRotating,
  positions,
  cardCnt,
  onOrbitComplete,
  onCardRevealComplete,
  browsingEnabled,
  browsedPosition,
  onBrowse,
}: Props) => {
  const slotPositions = usePickCardStoreSlotStore(
    (state) => state.slotPositions
  );
  const userPickedCardList = useUserPickNum((state) => state.inputs);
  const realCardList = useUserPickNum((state) => state.realCard);
  const usedPositions = useReadingSessionStore((state) => state.usedPositions);
  const shuffleStep = useShuffleTypeStore((state) => state.shuffleStep);
  const type = useTarotTypeStore((state) => state.type);
  const orientations = useCardOrientationStore((state) => state.orientations);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const completedRevealIndexes = useRef(new Set<number>());
  const pointer = useRef<number | null>(null);
  const browse = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!browsingEnabled) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const progress = (event.clientX - bounds.left - CARD_WIDTH / 2) / Math.max(1, bounds.width - CARD_WIDTH);
    const position = Math.max(1, Math.min(cardCnt, Math.round(progress * (cardCnt - 1)) + 1));
    if (!usedPositions.includes(position)) onBrowse(position);
  };
  const release = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointer.current !== event.pointerId) return;
    pointer.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
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
            if (!isPicked && usedPositions.includes(index + 1)) return null;
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
                  <CardLift $raised={browsingEnabled && !isPicked && browsedPosition === index + 1}>
                  {browsingEnabled && !isPicked && browsedPosition === index + 1 && <NumberBadge>{index + 1}번</NumberBadge>}
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
                  </CardLift>
                </CardBox>
              </OrbitLayer>
            );
          })}
        {shuffleStep === 4 && <BrowseArea role="slider" tabIndex={browsingEnabled ? 0 : -1}
          aria-label="카드 훑어보기" aria-disabled={!browsingEnabled} aria-valuemin={1} aria-valuemax={cardCnt}
          aria-valuenow={browsedPosition ?? 1} aria-valuetext={browsedPosition ? `${browsedPosition}번 카드` : "카드를 좌우로 훑어보세요"}
          onKeyDown={event => {
            if (!browsingEnabled || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
            event.preventDefault();
            const direction = event.key === "ArrowLeft" || event.key === "End" ? -1 : 1;
            let position = event.key === "Home" ? 1 : event.key === "End" ? cardCnt : (browsedPosition ?? (direction > 0 ? 0 : cardCnt + 1)) + direction;
            while (position >= 1 && position <= cardCnt && usedPositions.includes(position)) position += direction;
            if (position >= 1 && position <= cardCnt) onBrowse(position);
          }}
          onPointerDown={event => {
            if (!browsingEnabled || !event.isPrimary || event.button !== 0) return;
            pointer.current = event.pointerId;
            event.currentTarget.focus({ preventScroll: true });
            event.currentTarget.setPointerCapture(event.pointerId);
            browse(event);
          }}
          onPointerMove={event => { if (pointer.current === event.pointerId) browse(event); }}
          onPointerUp={release} onPointerCancel={release} onLostPointerCapture={() => { pointer.current = null; }} />}
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
  width: min(300px, calc(100% - 64px));
  height: 332px;
  margin: 0 auto;
  padding-top: 132px;
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

    const phaseDurationMs = ($shuffleStep === 1 ? 5000 : 3000) * SHUFFLE_TIME_SCALE;
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
      ? `top ${2 * SHUFFLE_TIME_SCALE}s ease, left ${2 * SHUFFLE_TIME_SCALE}s ease, transform ${2 * SHUFFLE_TIME_SCALE}s ease`
      : `top ${(2.65 + ($motionIndex % 7) * 0.025) * SHUFFLE_TIME_SCALE}s cubic-bezier(0.22, 0.7, 0.3, 1),
         left ${(2.7 + ($motionIndex % 5) * 0.03) * SHUFFLE_TIME_SCALE}s cubic-bezier(0.2, 0.68, 0.28, 1),
         transform ${(2.6 + ($motionIndex % 6) * 0.03) * SHUFFLE_TIME_SCALE}s cubic-bezier(0.24, 0.72, 0.32, 1)`};
  transition-delay: ${({ $motionIndex }) => ($motionIndex % 11) * 14 * SHUFFLE_TIME_SCALE}ms;
`;

const BrowseArea = styled.div`
  position:absolute;z-index:100;top:-${CARD_HEIGHT + 32}px;left:-${CARD_WIDTH / 2}px;
  width:calc(100% + ${CARD_WIDTH}px);height:${CARD_HEIGHT * 1.5 + 32}px;
  touch-action:pan-y;user-select:none;-webkit-user-select:none;cursor:ew-resize;border-radius:8px;
  &:focus-visible{outline:1px solid #edcf8a60;outline-offset:4px;}
  &[aria-disabled="true"]{pointer-events:none;}
`;

const CardLift = styled.div<{ $raised: boolean }>`
  width:100%;height:100%;position:relative;
  transform:translateY(${({ $raised }) => $raised ? "-50%" : "0"});
  transition:transform 210ms cubic-bezier(.2,.8,.3,1);
  @media(prefers-reduced-motion:reduce){transition:none;}
`;

const NumberBadge = styled.span`
  position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);
  padding:4px 8px;border-radius:20px;background:#edd394;color:#193b2d;
  font-size:12px;font-weight:700;white-space:nowrap;pointer-events:none;
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
  top: 185px;
  left: 8px;
  right: 8px;
  display: flex;
  justify-content: space-between;
  color: #d4af37;
  font-size: 13px;
  font-weight: 700;
  pointer-events: none;
`;
