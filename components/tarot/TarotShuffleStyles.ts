import styled, { css } from "styled-components";
import { CARD_WIDTH, CARD_HEIGHT } from "@/constants/tarot";
import { Clockwise, Counterclockwise } from "@/styles/rotateAnimations";

export const Container = styled.div`
  width: 300px;
  height: 300px;
  margin: 200px auto;
  position: relative;
`;

export const Box = styled.div<{
  $rotateWay: number | null;
  $isRotating: boolean;
}>`
  width: 100%;
  height: 100%;
  position: relative;
  transform-origin: center;
  ${({ $rotateWay, $isRotating }) =>
    $isRotating &&
    css`
      animation: ${$rotateWay === 1 ? Counterclockwise : Clockwise} 5s ease-out
        forwards;
    `}
`;

export const CardBox = styled.div<{
  $positionT: string;
  $positionL: string;
  $rotate: number;
}>`
  width: ${CARD_WIDTH}px;
  height: ${CARD_HEIGHT}px;
  border: 2px solid #fff;
  position: absolute;
  top: ${({ $positionT }) => `${$positionT}`};
  left: ${({ $positionL }) => `${$positionL}`};
  transform: ${({ $rotate }) => `translate(-50%, -50%) rotate(${$rotate}deg)`};
  transform-origin: center center;
  transition: top 5s ease, left 5s ease, transform 5s ease;
  transition: ${({ $positionT, $positionL }) =>
    $positionL === "50%" && $positionT === "50%"
      ? "top 2s ease, left 2s ease, transform 2s ease"
      : $positionL === "10%"
      ? "top 3s ease, left 3s ease, transform 3s ease"
      : "top 5s ease, left 5s ease, transform 5s ease"};
`;

export const FirstShuffle = styled.button`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  z-index: 10;
`;

export const InfoText = styled.p`
  color: #fff;
`;
