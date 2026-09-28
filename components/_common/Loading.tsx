"use client";

import Image from "next/image";
import styled, { keyframes } from "styled-components";

const Loading = ({ message = "잠시만 기다려 주세요", compact = false }: { message?: string; compact?: boolean }) => {
  return <Surface $compact={compact} role="status" aria-live="polite" aria-busy="true">
    <Clock $compact={compact} aria-hidden="true"><Image src="/sandClock.png" alt="" width={144} height={144} priority sizes={compact ? "56px" : "120px"} /></Clock>
    <p>{message}</p>
  </Surface>;
};

export default Loading;

const turn = keyframes`
  0%, 15% { transform: rotate(0deg); }
  40%, 65% { transform: rotate(180deg); }
  90%, 100% { transform: rotate(360deg); }
`;
const reveal = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
const Surface = styled.div<{ $compact: boolean }>`
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  width: 100%; min-height: ${({ $compact }) => $compact ? "120px" : "100dvh"};
  padding: ${({ $compact }) => $compact ? "12px" : "32px 20px"};
  gap: ${({ $compact }) => $compact ? "10px" : "22px"};
  background: ${({ $compact }) => $compact ? "transparent" : "radial-gradient(ellipse at center, #204a38, #0c3427 65%)"};
  color: #f1dfb0;
  > div, > p { animation: ${reveal} 120ms ease-out 180ms backwards; }
  @media (prefers-reduced-motion: reduce) { > div, > p { animation-duration: 0ms; } }
  && p { margin: 0; font-size: ${({ $compact }) => $compact ? "12px" : "14px"}; line-height: 1.7; text-align: center; word-break: keep-all; }
`;
const Clock = styled.div<{ $compact: boolean }>`
  width: ${({ $compact }) => $compact ? "56px" : "120px"}; aspect-ratio: 1;
  img { display: block; width: 100%; height: 100%; object-fit: contain; animation: ${turn} 4s ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce) { img { animation: none; } }
`;
