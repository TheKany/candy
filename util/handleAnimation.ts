import { keyframes } from "styled-components";

// 카드 돌아가는 랜덤 각
const randAngle = 390 + Math.random() * 180

// counterclockRotation
export const CounterclockRotation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-${randAngle}deg);
  }
`;

// clockRotation
export const ClockRotation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(${randAngle}deg);
  }
`;