"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import TarotCards from "@/public/data/tarotData.json";
import { Box, CardBox, Container, FirstShuffle } from "./TarotShuffleStyles";
import { handleCardShufflePosition } from "@/util/handleCardShufflePosition";

export default function TarotBoard() {
  const [positions, setPositions] = useState<
    { top: number; left: number; rotate: number }[]
  >([]);
  const [btnId, setBtnId] = useState(1);
  const [isRotating, setIsRotating] = useState(false);

  const onClickShuffle = () => {
    setIsRotating(true);
    setPositions(handleCardShufflePosition(TarotCards.length));
    setTimeout(() => {
      setIsRotating(false);
      setBtnId((prev) => (prev === 1 ? 2 : 1));
    }, 5000);
  };

  useEffect(() => {
    setPositions(handleCardShufflePosition(TarotCards.length));
  }, []);

  if (positions.length === 0) return null;

  return (
    <Container>
      <Box $rotateWay={btnId} $isRotating={isRotating}>
        {TarotCards.map((item, index) => (
          <CardBox
            key={index}
            $positionT={positions[index].top}
            $positionL={positions[index].left}
            $rotate={positions[index].rotate}
          >
            <Image src="/sample.png" alt="카드" width={150} height={250} />
          </CardBox>
        ))}
      </Box>
      <FirstShuffle onClick={onClickShuffle}>
        {btnId === 1 ? "셔플" : "질문"}
      </FirstShuffle>
    </Container>
  );
}
