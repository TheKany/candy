import styled, { css } from "styled-components";
import { CARD_WIDTH, CARD_HEIGHT } from "@/constants/tarot";
import { Clockwise, Counterclockwise } from "@/styles/rotateAnimations";

export const Container = styled.div`
  width: 600px;
  height: 600px;
  margin: 200px auto;
  position: relative;
`;

export const Box = styled.div<{ $rotateWay: number; $isRotating: boolean }>`
  width: 100%;
  height: 100%;
  position: relative;
  transform-origin: center;
  ${({ $rotateWay, $isRotating }) =>
    $isRotating &&
    css`
      animation: ${$rotateWay === 1 ? Counterclockwise : Clockwise} 5s ease-out forwards;
    `}
`;

export const CardBox = styled.div<{
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
  transform-origin: center center;
  transition: top 5s ease, left 5s ease, transform 5s ease;
`;

export const FirstShuffle = styled.button`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border: 2px solid black;
  padding: 10px 20px;
  font-size: 18px;
  cursor: pointer;
  z-index: 10;
`;
