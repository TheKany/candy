import { CELTIC_CROSS_POSITIONS } from "@/constants/celticCrossPositions";
import { usePickCardStoreSlotStore } from "@/store/usepickCardSlotStore";
import { useEffect, useRef } from "react";
import styled from "styled-components";

type Props = { finishedShuffle: boolean };

const SHORT_LABELS = [
  "현재", "장애물", "원인", "바람", "과거",
  "미래", "태도", "환경", "희망·두려움", "결과",
] as const;

export default function CelticCrossPickBoard({ finishedShuffle }: Props) {
  const setSlotPosition = usePickCardStoreSlotStore((state) => state.setSlotPosition);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!finishedShuffle) return;

    slotRefs.current.forEach((element, index) => {
      if (!element) return;
      const rect = element.getBoundingClientRect();
      setSlotPosition(index, {
        top: rect.top + window.scrollY + rect.height / 2,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    });
  }, [finishedShuffle, setSlotPosition]);

  return (
    <Board $visible={finishedShuffle} aria-label="켈틱 크로스 카드 열 장의 선택 자리">
      {CELTIC_CROSS_POSITIONS.map((position, index) => (
        <Slot
          key={position.id}
          $index={index}
          ref={(element) => {
            slotRefs.current[index] = element;
          }}
          aria-label={`${index + 1}번째 카드, ${position.label}`}
        >
          <Number>{index + 1}</Number>
          <Label>{SHORT_LABELS[index]}</Label>
        </Slot>
      ))}
    </Board>
  );
}

const SLOT_POSITIONS = [
  [78, 104], [78, 104], [78, 34], [78, 174], [20, 104],
  [136, 104], [210, 190], [210, 138], [210, 86], [210, 34],
] as const;

const Board = styled.div<{ $visible: boolean }>`
  position: relative;
  width: min(calc(100% - 32px), 248px);
  height: 240px;
  margin: 2px auto 14px;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  visibility: ${({ $visible }) => ($visible ? "visible" : "hidden")};
  transition: opacity 0.5s ease, visibility 0.5s ease;
`;

const Slot = styled.div<{ $index: number }>`
  position: absolute;
  top: ${({ $index }) => SLOT_POSITIONS[$index][1]}px;
  left: ${({ $index }) => SLOT_POSITIONS[$index][0]}px;
  z-index: ${({ $index }) => ($index === 1 ? 2 : 1)};
  display: grid;
  width: ${({ $index }) => ($index === 1 ? "46px" : "28px")};
  height: ${({ $index }) => ($index === 1 ? "28px" : "46px")};
  place-items: center;
  border: 1px dashed rgb(212 175 55 / 72%);
  border-radius: 5px;
  color: #f5d77e;
  background: rgb(8 38 29 / 86%);
  transform: translate(-50%, -50%);
`;

const Number = styled.strong`
  font-size: 10px;
  line-height: 1;
`;

const Label = styled.span`
  position: absolute;
  top: 100%;
  left: 50%;
  margin-top: 2px;
  color: rgb(255 247 223 / 72%);
  font-size: 8px;
  line-height: 1;
  white-space: nowrap;
  transform: translateX(-50%);
`;
