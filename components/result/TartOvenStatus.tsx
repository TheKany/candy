"use client";

import Link from "next/link";
import styled, { keyframes } from "styled-components";
import { READING_FAILURES, type ReadingFailureCode } from "@/util/readingFailure";

type Props = { error?: ReadingFailureCode | null; retrying?: boolean; onRetry: () => void; onHome: () => void };

export default function TartOvenStatus({ error, retrying = false, onRetry, onHome }: Props) {
  const failure = error ? READING_FAILURES[error] : null;
  const baking = !failure;
  const closed = error === "daily_quota" || error === "quota";
  const title = failure?.title ?? (retrying ? "오븐을 다시 데우고 있어요" : "당신의 이야기를 담아\n타르트를 굽고 있어요");
  const description = failure?.description ?? (retrying
    ? "해설 서버가 잠시 응답하지 못해 같은 카드로 한 번 더 준비하고 있어요."
    : "고른 카드의 의미와 당신의 질문을 함께 읽으며, 따뜻한 한 조각을 준비하고 있어요.");

  return <Screen>
    <Brand>타로타르트 · 작은 타로 베이커리</Brand>
    <Oven $baking={baking} $closed={closed} aria-hidden="true">
      <svg viewBox="0 0 280 235" focusable="false">
        <ellipse cx="140" cy="219" rx="113" ry="9" fill="#041a13" opacity=".5" />
        <path d="M45 198v18h19v-18m152 0v18h19v-18" fill="#b7a584" />
        <rect x="29" y="33" width="222" height="171" rx="22" fill="#dbc7a3" />
        <rect x="36" y="40" width="208" height="37" rx="16" fill="#eddbb8" />
        <circle cx="58" cy="58" r="9" fill="#7f785f" /><path d="M58 51v5" stroke="#fff3cf" strokeWidth="2" strokeLinecap="round" />
        <circle cx="88" cy="58" r="9" fill="#7f785f" /><path d="M88 51v5" stroke="#fff3cf" strokeWidth="2" strokeLinecap="round" />
        <rect x="172" y="48" width="50" height="20" rx="5" fill="#274b3c" />
        <circle className="oven-light" cx="185" cy="58" r="3" fill={baking ? "#ffd474" : closed ? "#8d9a8a" : "#dc9479"} />
        <path d="M196 55h15m-15 6h10" stroke="#c7c6a0" strokeWidth="2" strokeLinecap="round" />
        <rect x="44" y="85" width="192" height="104" rx="15" fill="#667565" />
        <rect x="51" y="92" width="178" height="90" rx="10" fill={baking ? "#614b2b" : "#243e32"} />
        <ellipse className="oven-glow" cx="140" cy="148" rx="73" ry="34" fill="#eaaa4c" opacity={baking ? ".3" : ".04"} />
        <path d="M66 170h148" stroke="#ac9b7b" strokeWidth="5" strokeLinecap="round" />
        {!closed && <g className="oven-tart">
          <path d="M91 148h98l-10 18h-78Z" fill="#c58940" />
          <path d="M99 152l4 11m10-11 2 11m12-11v11m13-11v11m13-11-1 11m14-11-3 11m14-11-5 11" stroke="#efc37c" strokeWidth="3" />
          <ellipse cx="140" cy="147" rx="50" ry="12" fill="#f0cb80" />
          <ellipse cx="140" cy="145" rx="40" ry="8" fill="#b25c49" />
          <circle cx="121" cy="140" r="7" fill="#d08061" /><circle cx="141" cy="137" r="8" fill="#de9572" /><circle cx="160" cy="140" r="7" fill="#d08061" />
          <path d="M136 132q5-10 13-5-4 6-13 5" fill="#8cab69" />
        </g>}
        {baking && <g className="oven-steam" fill="none" stroke="#ffe6ae" strokeWidth="2" strokeLinecap="round" opacity=".7"><path d="M113 128q-6-7 0-14t0-12"/><path d="M140 122q-6-7 0-14t0-12"/><path d="M167 128q-6-7 0-14t0-12"/></g>}
        <path d="M80 88h120" stroke="#f6e5c1" strokeWidth="7" strokeLinecap="round" />
        <path d="M44 197h192" stroke="#b3a183" strokeWidth="2" />
      </svg>
      <Sign>{failure?.sign ?? (retrying ? "한 번 더 준비 중" : "정성껏 굽는 중")}</Sign>
    </Oven>
    <Copy role={failure ? "alert" : "status"} aria-live="polite">
      <h1>{title}</h1>
      <p>{description}</p>
    </Copy>
    {baking && <Dots aria-hidden="true"><span /><span /><span /></Dots>}
    {failure && <Actions>
      {failure.retry && <button type="button" onClick={onRetry}>같은 카드로 다시 굽기</button>}
      {error === "blocked" && <Link href="/topic">질문 바꾸기</Link>}
      <button className="home" type="button" onClick={onHome}>홈으로</button>
    </Actions>}
    <Notice>고른 카드는 이 화면에서 그대로 유지돼요.</Notice>
  </Screen>;
}

const glow = keyframes`0%,100%{opacity:.2}50%{opacity:.45}`;
const rise = keyframes`0%,100%{transform:translateY(2px);opacity:.35}50%{transform:translateY(-3px);opacity:.8}`;
const bake = keyframes`0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.035)}`;
const pulse = keyframes`0%,100%{opacity:.3}50%{opacity:1}`;
const Screen = styled.section`
  min-height:100dvh; width:100%; padding:calc(26px + env(safe-area-inset-top)) 22px calc(24px + env(safe-area-inset-bottom));
  display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;
  color:#fff5dd; background:radial-gradient(ellipse at 50% 32%,#41583a55,transparent 55%),#0b2d24;
`;
const Brand = styled.p`font-size:11px;letter-spacing:1.2px;color:#d5c494;margin-bottom:18px;`;
const Oven = styled.div<{ $baking: boolean; $closed: boolean }>`
  width:min(100%,280px); position:relative; margin-bottom:26px;
  svg{display:block;width:100%;height:auto;}
  .oven-glow{animation:${glow} 3s ease-in-out infinite;animation-play-state:${({ $baking }) => $baking ? "running" : "paused"};}
  .oven-tart{transform-origin:140px 167px;animation:${bake} 4s ease-in-out infinite;animation-play-state:${({ $baking }) => $baking ? "running" : "paused"};}
  .oven-steam{animation:${rise} 3s ease-in-out infinite;}
  .oven-light{animation:${pulse} 2s ease-in-out infinite;animation-play-state:${({ $baking }) => $baking ? "running" : "paused"};}
  @media(prefers-reduced-motion:reduce){*{animation:none!important;}}
`;
const Sign = styled.span`display:inline-block;margin-top:2px;border:1px solid #bba87566;border-radius:7px;padding:7px 16px;background:#233f30;color:#e6d1a1;font-size:12px;letter-spacing:.5px;`;
const Copy = styled.div`
  max-width:340px; h1{font-size:clamp(19px,5.2vw,24px);font-weight:500;line-height:1.65;white-space:pre-line;word-break:keep-all;overflow-wrap:anywhere;margin:0 0 13px;}
  p{font-size:13px;line-height:1.85;word-break:keep-all;overflow-wrap:anywhere;color:#c7d2c3;}
`;
const Dots = styled.div`
  display:flex;gap:7px;margin-top:24px;
  span{width:5px;height:5px;border-radius:50%;background:#edcf8a;animation:${pulse} 1.8s ease-in-out infinite;}
  span:nth-child(2){animation-delay:.3s;}span:nth-child(3){animation-delay:.6s;}
  @media(prefers-reduced-motion:reduce){span{animation:none;}}
`;
const Actions = styled.div`
  display:grid;gap:10px;width:min(100%,300px);margin-top:26px;
  button,a{display:grid;place-items:center;min-height:46px;padding:12px;border:1px solid #ebcf8755;border-radius:12px;background:#edcf8a;color:#17392c;font-size:13px;font-weight:700;cursor:pointer;}
  .home{background:transparent;color:#e6d8b6;}
  button:focus-visible,a:focus-visible{outline:2px solid #edcf8a;outline-offset:3px;}
`;
const Notice = styled.p`font-size:11px;line-height:1.7;color:#a9bbab;margin-top:24px;`;
