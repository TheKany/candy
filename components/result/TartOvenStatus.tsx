"use client";

import Link from "next/link";
import Image from "next/image";
import styled, { keyframes } from "styled-components";
import { READING_FAILURES, type ReadingFailureCode } from "@/util/readingFailure";
import TartFailureIllustration from "./TartFailureIllustration";

type Props = { error?: ReadingFailureCode | null; retrying?: boolean; onRetry: () => void; onHome: () => void };

export default function TartOvenStatus({ error, retrying = false, onRetry, onHome }: Props) {
  const failure = error ? READING_FAILURES[error] : null;
  const baking = !failure;
  const title = failure?.title ?? (retrying ? "오븐을 다시 데우고 있어요" : "당신의 이야기를 담아\n타르트를 굽고 있어요");
  const description = failure?.description ?? (retrying
    ? "해설 서버가 잠시 응답하지 못해 같은 카드로 한 번 더 준비하고 있어요."
    : "고른 카드의 의미와 당신의 질문을 함께 읽으며, 따뜻한 한 조각을 준비하고 있어요.");

  return <Screen>
    <Brand>타로타르트 · 작은 타로 베이커리</Brand>
    <Oven $baking={baking} aria-hidden="true">
      <Scene $baking={baking}>
        {error ? <TartFailureIllustration code={error} /> : <>
          <Image src="/images/bakery/loading.webp" alt="" width={640} height={640} unoptimized priority />
          <Warmth />
          <Steam><i /><i /><i /></Steam>
        </>}
      </Scene>
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

const glow = keyframes`0%,100%{opacity:.08}50%{opacity:.25}`;
const rise = keyframes`0%{transform:translateY(5px) scaleX(.85);opacity:0}30%{opacity:.4}100%{transform:translateY(-22px) scaleX(1.1);opacity:0}`;
const pulse = keyframes`0%,100%{opacity:.3}50%{opacity:1}`;
const Screen = styled.section`
  min-height:100dvh; width:100%; padding:calc(26px + env(safe-area-inset-top)) 22px calc(24px + env(safe-area-inset-bottom));
  display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;
  color:#fff5dd; background:radial-gradient(ellipse at 50% 32%,#41583a55,transparent 55%),#0b2d24;
`;
const Brand = styled.p`font-size:11px;letter-spacing:1.2px;color:#d5c494;margin-bottom:18px;`;
const Oven = styled.div<{ $baking: boolean }>`
  width:min(100%,280px); position:relative; margin-bottom:24px;
  @media(max-height:700px){width:min(100%,230px);}
`;
const Scene = styled.div<{ $baking: boolean }>`
  position:relative;isolation:isolate;
  img{display:block;width:100%;height:auto;position:relative;z-index:1;}
  &::before{content:"";position:absolute;inset:12%;border-radius:50%;background:radial-gradient(ellipse,#d5b77518,transparent 70%);}
`;
const Warmth = styled.span`
  position:absolute;z-index:2;pointer-events:none;left:18%;top:42%;width:59%;height:32%;
  border-radius:30%;background:radial-gradient(ellipse,#ffd27b,transparent 72%);
  mix-blend-mode:screen;animation:${glow} 3.8s ease-in-out infinite;
  @media(prefers-reduced-motion:reduce){animation:none;opacity:.12;}
`;
const Steam = styled.span`
  position:absolute;z-index:2;left:40%;top:44%;width:23%;height:14%;pointer-events:none;
  display:flex;justify-content:space-between;
  i{height:75%;width:13%;border-left:2px solid #fff0c5;border-radius:50%;opacity:0;animation:${rise} 3.6s ease-in-out infinite;}
  i:nth-child(2){animation-delay:1.2s;}i:nth-child(3){animation-delay:2.4s;}
  @media(prefers-reduced-motion:reduce){display:none;}
`;
const Sign = styled.span`display:inline-block;margin-top:12px;border:1px solid #bba87533;border-radius:20px;padding:7px 16px;background:#233f30;color:#e6d1a1;font-size:12px;letter-spacing:.5px;`;
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
