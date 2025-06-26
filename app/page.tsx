"use client";

import Image from "next/image";
import styled, { css, keyframes } from "styled-components";
import { useEffect, useState } from "react";
import TarotCards from "@/public/data/tarotData.json";
import { ClockRotation, CounterclockRotation } from "@/util/handleAnimation";
import Wrapper from "@/components/_Wrapper";

const CARD_WIDTH = 150;
const CARD_HEIGHT = 250;
const RADIUS = 200;
const CENTER = 250;

export default function Home() {
  const [positions, setPositions] = useState<
    { top: number; left: number; rotate: number }[]
  >([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [btnId, setBtnId] = useState(1);

  const onClickShuffle = () => {
    setIsShuffle(true);

    // ⭐ 셔플 시 위치와 회전값 새로 설정
    const newPositions = TarotCards.map(() => {
      const angle = Math.random() * 360;
      const distance = RADIUS + Math.random() * 40 - 20;
      const x = CENTER + distance * Math.cos((angle * Math.PI) / 180);
      const y = CENTER + distance * Math.sin((angle * Math.PI) / 180);
      const rotate = Math.random() * 360 - 180;
      return { top: y, left: x, rotate };
    });
    setPositions(newPositions);

    setTimeout(() => {
      setIsShuffle(false);
      setBtnId(2);
    }, 5000);
  };

  useEffect(() => {
    const newPositions = TarotCards.map(() => {
      const angle = Math.random() * 360;
      const distance = RADIUS + Math.random() * 40 - 20;
      const x = CENTER + distance * Math.cos((angle * Math.PI) / 180);
      const y = CENTER + distance * Math.sin((angle * Math.PI) / 180);
      const rotate = Math.random() * 360 - 180;
      return { top: y, left: x, rotate };
    });
    setPositions(newPositions);
  }, []);

  if (positions.length === 0) return null;

  return (
    <Wrapper>
      <Container>
        <Box>
          {TarotCards.map((item, index) => (
            <CardWrapper
              key={index}
              $rotateWay={btnId}
              $isRotate={isShuffle}
              $duration={2 + Math.random() * 3}
            >
              <CardBox
                $positionT={positions[index].top}
                $positionL={positions[index].left}
                $rotate={positions[index].rotate}
              >
                <ImageEl
                  // src={item.src}
                  src={"/sample.png"}
                  alt="카드"
                  width={CARD_WIDTH}
                  height={CARD_HEIGHT}
                />
              </CardBox>
            </CardWrapper>
          ))}
        </Box>

        <FirstShuffle
          onClick={onClickShuffle}
          style={btnId === 1 ? { display: "block" } : { display: "none" }}
        >
          셔플
        </FirstShuffle>
        <FirstShuffle
          onClick={onClickShuffle}
          style={btnId === 2 ? { display: "block" } : { display: "none" }}
        >
          질문
        </FirstShuffle>
      </Container>
    </Wrapper>
  );
}

const ImageEl = styled(Image)`
  user-select: none;
  -webkit-user-drag: none;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 13px 27px -5px,
    rgba(0, 0, 0, 0.3) 0px 8px 16px -8px;
`;

const Container = styled.div`
  width: 600px;
  height: 600px;
  margin: 200px auto;
  position: relative;
`;

const Box = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const CardWrapper = styled.div<{
  $isRotate: boolean;
  $duration: number;
  $rotateWay: number;
}>`
  transform-origin: 250px 250px;
  animation: ${({ $isRotate, $rotateWay }) =>
    $rotateWay === 1 && $isRotate
      ? css`
          ${CounterclockRotation} 2s ease forwards;
        `
      : $rotateWay === 2 && $isRotate
      ? css`
          ${ClockRotation} 2s ease forwards;
        `
      : "none"};
  animation-duration: ${({ $duration }) => `${$duration}s`};
  animation-fill-mode: forwards;
`;

const CardBox = styled.div<{
  $positionT: number;
  $positionL: number;
  $rotate: number;
}>`
  width: ${CARD_WIDTH}px;
  height: ${CARD_HEIGHT}px;
  position: absolute;
  top: ${({ $positionT }) => `${$positionT}px`};
  left: ${({ $positionL }) => `${$positionL}px`};
  transform: ${({ $rotate }) => `translate(-50%, -50%) rotate(${$rotate}deg)`};
`;

const FirstShuffle = styled.button`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;
