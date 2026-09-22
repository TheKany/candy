"use client";

import styled from "styled-components";

export const Shell = styled.section`
  display: flex;
  width: min(100%, 480px);
  height: 100dvh;
  min-height: 520px;
  margin: 0 auto;
  flex-direction: column;
  overflow: hidden;
  padding: calc(12px + env(safe-area-inset-top)) 0 calc(8px + env(safe-area-inset-bottom));
  color: #fff7df;
  background: radial-gradient(circle at 18% 13%, rgb(226 184 85 / 18%), transparent 25%), linear-gradient(160deg, #08261d, #0c3427 50%, #061b15);
`;

export const Header = styled.header`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 12px 8px;
  font-size: clamp(0.72rem, 3vw, 0.84rem);
  span { color: rgb(255 247 223 / 70%); }
  strong { color: #f2ce72; }
`;

export const Viewport = styled.div`
  min-height: 0;
  flex: 1;
  overflow: hidden;
`;

export const Track = styled.div<{ $page: number }>`
  display: flex;
  width: 100%;
  height: 100%;
  transform: translateX(-${({ $page }) => $page * 100}%);
  transition: transform 360ms cubic-bezier(0.22, 0.7, 0.28, 1);

  @media (prefers-reduced-motion: reduce) { transition: none; }
`;

export const Slide = styled.article`
  flex: 0 0 100%;
  overflow-wrap: anywhere;
  width: 100%;
  min-width: 100%;
  min-height: 0;
  overflow-y: auto;
  padding: 4px clamp(10px, 5vw, 22px) 10px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

export const SummaryCard = styled.div`
  display: flex;
  min-height: 100%;
  flex-direction: column;
  justify-content: center;
  padding: clamp(18px, 5vh, 34px) clamp(14px, 5vw, 24px);
  border: 1px solid rgb(231 202 112 / 65%);
  border-radius: 20px;
  background: linear-gradient(145deg, rgb(42 79 65 / 96%), rgb(18 52 41 / 98%));
  box-shadow: 0 14px 34px rgb(0 0 0 / 24%);
  h1 { margin: 14px 0 24px; font-family: "NotoSerifKR", serif; font-size: clamp(1.12rem, 5.2vw, 1.48rem); line-height: 1.65; word-break: keep-all; overflow-wrap: anywhere; }
`;

export const Overview = styled.div`
  font-size: clamp(0.9rem, 3.6vw, 1rem);
  line-height: 1.85;
  color: rgb(255 247 223 / 88%);
  word-break: keep-all;
  overflow-wrap: anywhere;
  p { margin: 0 0 20px; }
`;

export const Eyebrow = styled.span`
  color: #f2ce72;
  font-size: 0.76rem;
  font-weight: 900;
`;

export const FlowLine = styled.p`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 8px;
  margin: 8px 0 0;
  padding-top: 18px;
  border-top: 1px solid rgb(242 206 114 / 24%);
  span:not(:last-child)::after { content: " →"; margin-left: 8px; opacity: .6; }
  color: #f5d77e;
  font-size: clamp(0.72rem, 3.2vw, 0.86rem);
  font-weight: 800;
  line-height: 1.6;
  text-align: center;
  word-break: keep-all;
`;

export const Advice = styled.div`
  white-space: pre-line;
  margin-top: clamp(18px, 4vh, 28px);
  padding: 17px 15px;
  border-radius: 15px;
  color: #294d40;
  background: #fff2bb;
  span { color: #80662c; font-size: 0.72rem; font-weight: 900; }
  p { margin: 7px 0 0; font-size: clamp(0.84rem, 3.5vw, 0.96rem); line-height: 1.7; word-break: keep-all; }
`;

export const CardPage = styled.div`
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  padding: 10px clamp(10px, 4vw, 18px) 16px;
  text-align: center;
  h2 { margin: 6px 0 0; color: #fff6dc; font-size: clamp(1.2rem, 5.5vw, 1.55rem); }
`;

export const Position = styled.span`
  color: #f2ce72;
  font-size: clamp(0.72rem, 3.2vw, 0.84rem);
  font-weight: 900;
`;

export const English = styled.span`
  margin-top: 2px;
  color: rgb(255 247 223 / 62%);
  font-family: Georgia, serif;
  font-size: 0.72rem;
`;

export const CardImage = styled.div`
  width: clamp(82px, 31vw, 124px);
  margin-top: 8px;
  overflow: hidden;
  border: 2px solid #e4c668;
  border-radius: 8px;
  box-shadow: 0 10px 24px rgb(0 0 0 / 28%);
  img { display: block; width: 100%; height: auto; }
`;

export const RoleLabel = styled.strong`
  margin-top: 8px;
  color: #f2ce72;
  font-size: clamp(0.92rem, 4.2vw, 1.08rem);
`;

export const RoleDescription = styled.span`
  margin-top: 2px;
  color: rgb(255 247 223 / 66%);
  font-size: clamp(0.68rem, 2.9vw, 0.8rem);
`;

export const Reading = styled.div`
  p { white-space: pre-line; }
  width: 100%;
  margin-top: 12px;
  padding: 15px 14px;
  border: 1px solid rgb(242 206 114 / 32%);
  border-radius: 14px;
  background: rgb(255 255 255 / 6%);
  text-align: left;
  strong { color: #fff0bd; font-size: clamp(0.84rem, 3.5vw, 0.96rem); }
  p { margin: 8px 0 0; color: rgb(255 247 223 / 86%); font-size: clamp(0.76rem, 3.2vw, 0.9rem); line-height: 1.65; word-break: keep-all; }
`;

export const Question = styled.p`
  width: 100%;
  margin: 10px 0 0;
  padding: 12px;
  border-radius: 12px;
  color: #294d40;
  background: #fff2bb;
  font-size: clamp(0.72rem, 3.1vw, 0.84rem);
  font-weight: 700;
  line-height: 1.55;
  word-break: keep-all;
`;

export const Pager = styled.nav`
  display: grid;
  min-width: 0;
  flex: 0 0 auto;
  grid-template-columns: 64px minmax(0, 1fr) 64px;
  align-items: center;
  gap: 6px;
  padding: 8px clamp(10px, 4vw, 18px) 0;
`;

export const NavButton = styled.button<{ $home?: boolean }>`
  min-width: 0;
  min-height: 40px;
  border: 1px solid ${({ $home }) => $home ? "#ffe29a" : "rgb(242 206 114 / 48%)"};
  border-radius: 11px;
  color: ${({ $home }) => $home ? "#123a2b" : "#fff6dc"};
  background: ${({ $home }) => $home ? "#f2ce72" : "rgb(255 255 255 / 6%)"};
  font-size: 0.76rem;
  font-weight: 800;
  cursor: pointer;
  &:disabled { cursor: default; opacity: 0.28; }
`;

export const Dots = styled.div`
  display: flex;
  min-width: 0;
  justify-content: center;
  gap: 8px;
`;

export const Dot = styled.span<{ $active: boolean }>`
  display: block;
  width: ${({ $active }) => $active ? "20px" : "8px"};
  height: 8px;
  border-radius: 999px;
  background: ${({ $active }) => $active ? "#f2ce72" : "rgb(255 247 223 / 30%)"};
  transition: width 180ms ease;
`;

export const NavigationHint = styled.p`
  flex: 0 0 auto;
  margin: 5px 0 0;
  color: rgb(255 247 223 / 52%);
  font-size: clamp(0.62rem, 2.7vw, 0.72rem);
  text-align: center;
`;

export const Status = styled.div`
  display: grid;
  min-height: 100dvh;
  place-content: center;
  gap: 14px;
  padding: 24px;
  color: #fff6dc;
  background: #08261d;
  text-align: center;
  button { min-height: 44px; padding: 0 16px; border-radius: 12px; color: #123a2b; background: #f2ce72; font-weight: 800; }
`;
