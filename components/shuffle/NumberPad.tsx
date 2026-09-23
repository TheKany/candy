import { useUserPickNum } from "@/store/useUserPickNumStore";
import { useTarotTypeStore } from "@/store/useTarotTypeStore";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getCardAtPosition } from "@/util/cardSelectionFlow";
import { getNextPositionLabel, getRequiredCardCount } from "@/util/cardSelectionFlow";
import { useMonthlyReadingStore } from "@/store/useMonthlyReadingStore";
import { useThreeCardSpreadStore } from "@/store/useThreeCardSpreadStore";
import { useCardOrientationStore } from "@/store/useCardOrientationStore";
import { getRandomOrientation } from "@/constants/celticCrossPositions";
import { useReadingSessionStore } from "@/store/useReadingSessionStore";

type Props = {
  finishedShuffle: boolean;
  deck: number[];
  selectionLocked: boolean;
  onSelectionStarted: () => void;
  number: string;
  setNumber: React.Dispatch<React.SetStateAction<string>>;
};

const NumberPad = ({
  finishedShuffle,
  deck,
  selectionLocked,
  onSelectionStarted,
  number,
  setNumber,
}: Props) => {
  const { setInput, setRealCard } = useUserPickNum();
  const type = useTarotTypeStore((state) => state.type);
  const spread = useThreeCardSpreadStore((state) => state.spread);
  const addOrientation = useCardOrientationStore((state) => state.addOrientation);

  const [pickedNumList, setPickNumList] = useState<number[]>([]);
  const [error, setError] = useState("");
  useEffect(() => setError(""), [number]);
  const usedPositions = useReadingSessionStore((state) => state.usedPositions);
  const isFollowUp = useReadingSessionStore((state) => state.previousConsultation !== null);
  const monthlyPeriod = useMonthlyReadingStore(state => state.period);
  const nextPositionLabel = getNextPositionLabel(type, spread, pickedNumList.length, monthlyPeriod?.months);

  const onClickNumberBtn = (id: number | string) => {
    if (selectionLocked) return;
    setError("");
    if (number.length === 0 && id === 0) return;

    if (typeof id === "number") {
      const next = number + id.toString();
      const nextNum = Number(next);

      if (nextNum > 78) return;
      if (number.length >= 2) return;

      setNumber(next);
    }

    if (id === "remove") {
      setNumber((prev) => prev.slice(0, -1));
    }

    if (id === "check") {
      if (!number) return;

      const cardNum = Number(number);

      // 유효하지 않은 숫자 no
      if (isNaN(cardNum)) return;
      if (cardNum < 1 || cardNum > 78) return;

      // 중복된 카드 no
      if (usedPositions.includes(cardNum)) { setError("이미 뽑은 카드예요. 다른 번호를 골라주세요."); return; }

      // 선택 개수 초과 no
      if (pickedNumList.length >= getRequiredCardCount(type, monthlyPeriod?.months.length)) return;
      if (type === null) return;

      const realCard = getCardAtPosition(deck, cardNum);
      if (realCard === null) return;
      if (!useReadingSessionStore.getState().pick(cardNum)) return;

      onSelectionStarted();
      setInput(String(number));
      setRealCard(String(realCard));
      if (type === "celtic") addOrientation(getRandomOrientation());
      setPickNumList((prev) => [...prev, cardNum]);

      setNumber("");
    }
  };

  return (
    <Box $isFinish={finishedShuffle}>
      <Typing aria-live="polite">
        <TypingLabel>
          {type === "monthly" && nextPositionLabel ? `${nextPositionLabel} 카드 고르기` : (type === "three" || type === "five" || type === "celtic") && nextPositionLabel
            ? `${pickedNumList.length + 1}번째 · ${nextPositionLabel} 카드 고르기`
            : "고른 운명의 카드"}
        </TypingLabel>
        <TypingNumber>{number || "—"}</TypingNumber>
      </Typing>
      <InfoText>카드를 훑거나 번호를 입력한 뒤 결정해주세요.</InfoText>
      {isFollowUp && <InfoText>남은 카드 {deck.length - usedPositions.length}장 · 기존 번호 그대로</InfoText>}
      {error && <InfoText role="alert">{error}</InfoText>}
      <NumberContainer>
        {Array.from({ length: 12 }).map((_, idx) => {
          if (idx < 9) {
            return (
              <NumberBtn
                key={idx + 1}
                disabled={selectionLocked}
                onClick={() => onClickNumberBtn(idx + 1)}
              >
                {idx + 1}
              </NumberBtn>
            );
          } else if (idx === 9) {
            return (
              <NumberBtn
                key={"remove"}
                disabled={selectionLocked}
                onClick={() => onClickNumberBtn("remove")}
              >
                지우기
              </NumberBtn>
            );
          } else if (idx === 11) {
            return (
              <NumberBtn
                key={"check"}
                disabled={selectionLocked}
                onClick={() => onClickNumberBtn("check")}
              >
                결정
              </NumberBtn>
            );
          } else {
            return (
              <NumberBtn
                key={0}
                disabled={selectionLocked}
                onClick={() => onClickNumberBtn(0)}
              >
                0
              </NumberBtn>
            );
          }
        })}
      </NumberContainer>
    </Box>
  );
};

export default NumberPad;

const Box = styled.div<{ $isFinish: boolean }>`
  width: min(100%, 360px);
  margin: 0 auto;
  padding: 0 16px 28px;
  opacity: ${({ $isFinish }) => ($isFinish ? 1 : 0)};
  visibility: ${({ $isFinish }) => ($isFinish ? "visible" : "hidden")};

  transition: opacity 0.5s ease-in-out, visibility 0.5s ease-in-out;
`;

const Typing = styled.div`
  min-height: 50px;
  padding: 9px 14px;
  border: 1px solid #d4af37;
  border-radius: 12px;
  background: rgba(212, 175, 55, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #f7f3e8;
`;

const TypingLabel = styled.span`
  min-width: 0;
  font-size: clamp(13px, 4vw, 15px);
  word-break: keep-all;
`;

const TypingNumber = styled.strong`
  min-width: 28px;
  color: #d4af37;
  font-size: 20px;
  text-align: right;
`;

const InfoText = styled.p`
  color: #ccc;
  font-size: 14px;
  text-align: center;
  padding-top: 4px;
`;

const NumberContainer = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 16px;
`;

const NumberBtn = styled.button`
  width: 100%;
  height: 50px;
  background-color: #eadbc8;
  border-radius: 8px;

  font-weight: 500;
  font-size: 16px;

  &:active {
    background-color: #fff;
  }

  &:disabled {
    cursor: default;
    opacity: 0.55;
  }
`;
