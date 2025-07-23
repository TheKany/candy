import { usePickCardStore } from "@/store/pickCardStore";
import { useTarotTypeStore } from "@/store/tarotTypeStore";
import React, { useState } from "react";
import styled from "styled-components";

type Props = {
  finishedShuffle: boolean;
  deck: number[];
  hiddenText: boolean;
};

const NumberPad = ({ finishedShuffle, deck, hiddenText }: Props) => {
  const type = useTarotTypeStore((state) => state.type);
  const pickedCardList = usePickCardStore((state) => state.pickedCardList);
  const setPickedCardList = usePickCardStore(
    (state) => state.setPickedCardList
  );

  const [chooseNum, setChooseNum] = useState<string>("");
  const [pickedNumList, setPickNumList] = useState<number[]>([]);

  const onClickNumberBtn = (id: number | string) => {
    if (typeof id === "number") {
      const next = chooseNum + id.toString();
      const nextNum = Number(next);

      if (nextNum > 78) return;
      if (chooseNum.length >= 2) return;

      setChooseNum(next);
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
      <ChooseCardNum>
        {hiddenText ? (
          <>운명을 찾는 중 ...</>
        ) : (
          <>
            운명의 카드는 <span>{chooseNum}</span>번째 카드
          </>
        )}
      </ChooseCardNum>
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
  width: 100%;
  text-align: center;
  font-size: 18px;
  font-weight: 500;
  color: #d4af37;

  position: absolute;
  left: 50%;
  top: -15%;
  transform: translate(-50%, -50%);

  & span {
    color: #fff;
    border-bottom: 1px solid #d4af37;
    padding: 0 4px;
  }
`;

const NumberContainer = styled.div<{ $isFinish: boolean }>`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;

  position: absolute;
  bottom: -5%;

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
