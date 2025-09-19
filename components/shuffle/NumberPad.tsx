import { useUserPickNum } from "@/store/useUserPickNumStore";
import { useTarotTypeStore } from "@/store/useTarotTypeStore";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useRouter } from "next/navigation";

type Props = {
  finishedShuffle: boolean;
  deck: number[];
};

const NumberPad = ({ finishedShuffle, deck }: Props) => {
  const router = useRouter();
  const { setInput, setRealCard } = useUserPickNum();
  const type = useTarotTypeStore((state) => state.type);

  const [pickedNumList, setPickNumList] = useState<number[]>([]);
  const [number, setNumber] = useState("");

  const onClickNumberBtn = (id: number | string) => {
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
      if (pickedNumList.includes(cardNum)) return;

      // 선택 개수 초과 no
      if (type === "one" && pickedNumList.length >= 1) return;
      if (type === null) return;

      const realCard = deck[cardNum - 1];
      setInput(String(number));
      setRealCard(String(realCard));
      setPickNumList((prev) => [...prev, cardNum]);

      setNumber("");
    }
  };

  useEffect(() => {
    if (type === "three" && pickedNumList.length == 3) {
      return router.replace("/result");
    }

    if (type === "one" && pickedNumList.length == 1) {
      return router.replace("/result");
    }
  }, [pickedNumList]);

  return (
    <Box $isFinish={finishedShuffle}>
      <Typing>고른 운명의 카드 : {number}</Typing>
      <InfoText>[ 1 ~ 78번까지의 카드 중에서 골라주세요. ]</InfoText>
      <NumberContainer>
        {Array.from({ length: 12 }).map((_, idx) => {
          if (idx < 9) {
            return (
              <NumberBtn
                key={idx + 1}
                onClick={() => onClickNumberBtn(idx + 1)}
              >
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
              <NumberBtn
                key={"check"}
                onClick={() => onClickNumberBtn("check")}
              >
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
    </Box>
  );
};

export default NumberPad;

const Box = styled.div<{ $isFinish: boolean }>`
  opacity: ${({ $isFinish }) => ($isFinish ? 1 : 0)};
  visibility: ${({ $isFinish }) => ($isFinish ? "visible" : "hidden")};

  transition: opacity 0.5s ease-in-out, visibility 0.5s ease-in-out;
`;

const Typing = styled.p`
  color: #fff;
  height: 20px;
  text-align: start;
  padding-left: 20%;
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
`;
