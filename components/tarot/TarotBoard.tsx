"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Box, CardBox, Container, FirstShuffle } from "./TarotShuffleStyles";
import { handleCardShufflePosition } from "@/util/handleCardShufflePosition";
import { useShuffleType } from "@/store/shuffleTypeStore";
import styled from "styled-components";
import { useRouter } from "next/navigation";
import { getCardCount } from "@/util/getCardData";
import { usePickCard } from "@/store/pickCardStore";

const TarotBoard = () => {
  const router = useRouter();
  const { setPickWay } = usePickCard();
  const { shuffleStep, setShuffleStep } = useShuffleType();

  const [cardCnt, setCardCnt] = useState<number>(0);
  const [positions, setPositions] = useState<
    { top: string; left: string; rotate: number }[]
  >([]);
  const [isRotating, setIsRotating] = useState(false);

  const onClickShuffle = (id: number | null) => {
    if (isRotating) return;

    if (id === null) {
      setShuffleStep(1);
      return;
    }

    setIsRotating(true);
    setPositions(handleCardShufflePosition(cardCnt));

    if (id === 1) {
      setTimeout(() => {
        setIsRotating(false);
        setShuffleStep(2);
      }, 5000);
    }

    if (id === 2) {
      setTimeout(() => {
        setPositions((prev) =>
          prev.map(() => ({
            top: "50%",
            left: "50%",
            rotate: 0,
          }))
        );
      }, 6000);

      setShuffleStep(4);

      setTimeout(() => {
        setIsRotating(false);
        setPositions((prev) =>
          prev.map((_, index) => ({
            top: `${2 + index * 1}%`,
            left: "10%",
            rotate: 0,
          }))
        );
      }, 9000);

      setTimeout(() => {
        setShuffleStep(3);
      }, 10000);
    }
  };

  // 카드 뽑기
  const onClickPickCard = (id: "top" | "bot") => {
    setPickWay(id);
    router.replace("/result");
  };

  useEffect(() => {
    if (cardCnt > 0) {
      setPositions(handleCardShufflePosition(cardCnt));
    }
  }, [cardCnt]);

  useEffect(() => {
    const onLoadData = async () => {
      const result = await getCardCount();
      setCardCnt(result);
    };

    onLoadData();
  }, []);

  return (
    <Container>
      <Box $rotateWay={shuffleStep} $isRotating={isRotating}>
        {positions.length === cardCnt &&
          Array.from({ length: cardCnt }).map((_, index) => (
            <CardBox
              key={index}
              $positionT={positions[index].top}
              $positionL={positions[index].left}
              $rotate={positions[index].rotate}
            >
              <Image
                src="/cardBack.png"
                alt="카드"
                width={0}
                height={0}
                fill
                unoptimized
              />
            </CardBox>
          ))}
      </Box>

      {shuffleStep === null && (
        <FirstShuffle onClick={() => onClickShuffle(null)}>
          시작하기
        </FirstShuffle>
      )}

      {shuffleStep === 1 && (
        <FirstShuffle onClick={() => onClickShuffle(1)}>카드 섞기</FirstShuffle>
      )}

      {shuffleStep === 2 && (
        <FirstShuffle onClick={() => onClickShuffle(2)}>카드 섞기</FirstShuffle>
      )}

      {shuffleStep === 3 && (
        <ButtonContainer>
          <button onClick={() => onClickPickCard("bot")}>Bottom</button>
          <button onClick={() => onClickPickCard("top")}>Top</button>
        </ButtonContainer>
      )}
    </Container>
  );
};

export default TarotBoard;

const ButtonContainer = styled.div`
  width: 50%;
  height: 50vh;

  position: absolute;
  top: 50%;
  right: 0;
  transform: translate(0, -50%);

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  & button {
    color: #fff;
    font-size: 18px;

    background-color: #2d5577;
    padding: 8px;
    border-radius: 8px;

    box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
  }
`;
