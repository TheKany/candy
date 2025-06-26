import { keyframes } from "styled-components";

// counterclockRotation
export const CounterclockRotation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
`;

// clockRotation
export const ClockRotation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;