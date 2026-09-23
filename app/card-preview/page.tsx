"use client";

import Link from "next/link";
import { useRef, useState, type PointerEvent, type KeyboardEvent } from "react";
import styled from "styled-components";

const CARD_COUNT = 78;

export default function CardPreviewPage() {
  const [active, setActive] = useState<number | null>(null);
  const pointer = useRef<number | null>(null);

  const browse = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const cardWidth = Number.parseFloat(getComputedStyle(event.currentTarget).getPropertyValue("--card-width"));
    const progress = (event.clientX - bounds.left - cardWidth / 2) / Math.max(1, bounds.width - cardWidth);
    setActive(Math.max(0, Math.min(CARD_COUNT - 1, Math.round(progress * (CARD_COUNT - 1)))));
  };
  const move = (direction: number) => setActive(current => Math.max(0, Math.min(CARD_COUNT - 1, (current ?? 0) + direction)));
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Home") setActive(0);
    else if (event.key === "End") setActive(CARD_COUNT - 1);
    else move(event.key === "ArrowRight" ? 1 : -1);
  };
  const release = (event: PointerEvent<HTMLDivElement>) => {
    if (pointer.current !== event.pointerId) return;
    pointer.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return <Page>
    <Bar><Link href="/select">← 타로 선택으로</Link><span>모션 미리보기</span></Bar>
    <Content>
      <Heading><span>손끝에 머무는 한 장</span><h1>마음이 가는 카드를<br />천천히 훑어보세요</h1><p>카드를 누른 채 좌우로 움직여보세요.<br />손을 떼면 그 카드가 머물러요.</p></Heading>
      <DeckArea>
        <Deck role="slider" tabIndex={0} aria-label="카드 훑어보기" aria-valuemin={1} aria-valuemax={CARD_COUNT}
          aria-valuenow={(active ?? 0) + 1} aria-valuetext={active === null ? "아직 살펴보는 카드 없음" : `${active + 1}번 카드`}
          onKeyDown={onKeyDown}
          onPointerDown={event => {
            if (!event.isPrimary || event.button !== 0) return;
            pointer.current = event.pointerId;
            event.currentTarget.focus({ preventScroll: true });
            event.currentTarget.setPointerCapture(event.pointerId);
            browse(event);
          }}
          onPointerMove={event => { if (pointer.current === event.pointerId) browse(event); }}
          onPointerUp={release} onPointerCancel={release} onLostPointerCapture={() => { pointer.current = null; }}>
          {Array.from({ length: CARD_COUNT }, (_, index) => <Card key={index} $active={active === index}
            style={{ left: `calc((100% - var(--card-width)) * ${index / (CARD_COUNT - 1)})`, zIndex: index }} aria-hidden="true">
            {active === index && <NumberBadge>{index + 1}번</NumberBadge>}
            <Back />
          </Card>)}
        </Deck>
        <Ends aria-hidden="true"><span>1번</span><span>78번</span></Ends>
      </DeckArea>
      <Selection>
        <p aria-live="polite" aria-atomic="true">{active === null ? "어떤 카드가 눈에 들어오나요?" : <><strong>{active + 1}번</strong> 카드에 머물렀어요</>}</p>
        <Steps>
          <button type="button" aria-label="이전 카드" disabled={active === null || active === 0} onClick={() => move(-1)}>←</button>
          <span>한 장씩 살펴보기</span>
          <button type="button" aria-label="다음 카드" disabled={active === CARD_COUNT - 1} onClick={() => active === null ? setActive(0) : move(1)}>→</button>
        </Steps>
        <Reset type="button" onClick={() => setActive(null)} disabled={active === null}>다시 펼쳐놓기</Reset>
      </Selection>
      <Notice>체험용 화면이에요.<br />실제 카드를 뽑거나 해설을 요청하지 않아요.</Notice>
    </Content>
  </Page>;
}

const Page = styled.main`
  min-height:100dvh;width:100%;color:#fff5dd;background:radial-gradient(ellipse at 50% 42%,#274c39 0%,#0b2d24 60%);
`;
const Bar = styled.header`
  display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px 12px;
  padding:calc(8px + env(safe-area-inset-top)) 16px 8px;border-bottom:1px solid #edcf8a25;
  a{display:flex;align-items:center;min-height:44px;font-size:13px;color:#edcf8a;}
  span{font-size:10px;color:#b7c7b7;}
`;
const Content = styled.div`
  max-width:620px;margin:auto;padding:30px 18px calc(24px + env(safe-area-inset-bottom));
  @media(max-width:319px){padding-left:12px;padding-right:12px;}
`;
const Heading = styled.header`
  text-align:center;
  >span{font-size:11px;color:#d8bb77;letter-spacing:2px;}
  h1{font-size:clamp(21px,5.5vw,28px);line-height:1.6;font-weight:500;margin:12px 0;word-break:keep-all;}
  p{font-size:12px;line-height:1.9;color:#b8c9bc;}
`;
const DeckArea = styled.section`margin:24px 0 28px;`;
const Deck = styled.div`
  --card-width:54px;--card-height:90px;
  position:relative;width:100%;height:195px;touch-action:pan-y;user-select:none;-webkit-user-select:none;cursor:ew-resize;
  outline:none;border-radius:12px;
  &:focus-visible{outline:1px solid #edcf8a80;outline-offset:6px;}
  @media(min-width:420px){--card-width:66px;--card-height:110px;height:230px;}
`;
const Card = styled.div<{ $active: boolean }>`
  position:absolute;bottom:0;width:var(--card-width);height:var(--card-height);pointer-events:none;
  transform:translateY(${({ $active }) => $active ? "-50%" : "0"});
  transition:transform 210ms cubic-bezier(.2,.8,.3,1);
  filter:${({ $active }) => $active ? "drop-shadow(0 8px 8px #0007)" : "none"};
  @media(prefers-reduced-motion:reduce){transition:none;}
`;
const Back = styled.div`
  width:100%;height:100%;border:1px solid #d4bc7d;border-radius:5px;
  background:#15372b url('/cardBack.png') center/100% 100% no-repeat;
  box-shadow:-1px 0 2px #03140e80;
`;
const NumberBadge = styled.span`
  position:absolute;bottom:calc(100% + 10px);left:50%;transform:translateX(-50%);
  min-width:42px;padding:5px 8px;border-radius:20px;background:#edd394;color:#193b2d;
  font-size:12px;font-weight:700;white-space:nowrap;text-align:center;
`;
const Ends = styled.div`display:flex;justify-content:space-between;margin-top:14px;color:#bdc9b4;font-size:11px;`;
const Selection = styled.div`
  text-align:center;
  >p{min-height:26px;font-size:14px;color:#d9dfcb;strong{color:#f2d28b;font-weight:600;}}
`;
const Steps = styled.div`
  display:flex;justify-content:center;align-items:center;gap:18px;margin:18px 0;
  span{font-size:11px;color:#b2c3b4;}
  button{width:44px;height:44px;border:1px solid #d9bf7844;border-radius:50%;color:#edcf8a;background:#ffffff05;cursor:pointer;}
  button:disabled{opacity:.25;cursor:default;}
  button:focus-visible{outline:2px solid #edcf8a;outline-offset:3px;}
`;
const Reset = styled.button`
  min-height:44px;padding:10px 22px;border:1px solid #e6cb8533;border-radius:12px;color:#e6d5a7;font-size:12px;cursor:pointer;
  &:disabled{opacity:.35;cursor:default;}
  &:focus-visible{outline:2px solid #edcf8a;outline-offset:3px;}
`;
const Notice = styled.p`text-align:center;margin:24px 0 0;color:#92ab99;font-size:10px;line-height:1.8;`;
