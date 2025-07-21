import { usePickCard } from "@/store/pickCardStore";
import { useTarotType } from "@/store/tarotTypeStore";
import React, { useState } from "react";
import styled from "styled-components";

type Props = {
  finishedShuffle: boolean;
  deck: number[];
};

const NumberPad = ({ finishedShuffle, deck }: Props) => {
  const { type } = useTarotType();
  const { pickedCardList, setPickedCardList } = usePickCard();
  const [chooseNum, setChooseNum] = useState<string>("");
  const [pickedNumList, setPickNumList] = useState<number[]>([]);
  const onClickNumberBtn = (id: number | string) => {
    if (typeof id === "number") {
      if (chooseNum.length > 1) return;
      setChooseNum((prev) => prev + id);
    }

    if (id === "remove") {
      setChooseNum((prev) => prev.slice(0, -1));
    }

    if (id === "check") {
      if (!chooseNum) return;

      const cardNum = Number(chooseNum);

      // 유효하지 않은 숫자 no
      if (isNaN(cardNum)) return;
      if (cardNum < 1 || cardNum > 78) return;

      // 중복된 카드 no
      if (pickedNumList.includes(cardNum)) return;

      // 선택 개수 초과 no
      if (type === "one" && pickedNumList.length >= 1) return;
      if ((type === "three" || type === "Yn") && pickedNumList.length >= 3)
        return;
      if (type === null) return;

      const realCard = deck[cardNum - 1];
      setPickedCardList([...pickedCardList, realCard]);
      setPickNumList((prev) => [...prev, cardNum]);
      setChooseNum("");
    }
  };

  return (
    <NumberContainer $isFinish={finishedShuffle}>
      <ChooseCardNum>{chooseNum}</ChooseCardNum>
      {Array.from({ length: 12 }).map((_, idx) => {
        if (idx < 9) {
          return (
            <NumberBtn key={idx + 1} onClick={() => onClickNumberBtn(idx + 1)}>
              {idx + 1}
            </NumberBtn>
          );
        } else if (idx === 9) {
          return (
            <NumberBtn
              key={"remove"}
              onClick={() => onClickNumberBtn("remove")}
            >
              지우기
            </NumberBtn>
          );
        } else if (idx === 11) {
          return (
            <NumberBtn key={"check"} onClick={() => onClickNumberBtn("check")}>
              결정
            </NumberBtn>
          );
        } else {
          return (
            <NumberBtn key={0} onClick={() => onClickNumberBtn(0)}>
              0
            </NumberBtn>
          );
        }
      })}
    </NumberContainer>
  );
};

export default NumberPad;

const ChooseCardNum = styled.p`
  text-align: center;
  font-size: 32px;
  font-weight: 500;
  color: #d4af37;

  position: absolute;
  left: 50%;
  top: -15%;
  transform: translate(-50%, -50%);
`;

const NumberContainer = styled.div<{ $isFinish: boolean }>`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;

  position: absolute;
  bottom: 0;

  opacity: ${({ $isFinish }) => ($isFinish ? 1 : 0)};
  visibility: ${({ $isFinish }) => ($isFinish ? "visible" : "hidden")};

  transition: opacity 0.5s ease-in-out, visibility 0.5s ease-in-out;
`;

const NumberBtn = styled.button`
  width: 100%;
  height: 50px;
  background-color: #eadbc8;
  border-radius: 8px;

  font-weight: 500;
  font-size: 16px;
`;
