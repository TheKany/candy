"use client";

import { useRef, useState } from "react";
import styled, { keyframes } from "styled-components";

export default function PackagingPreview() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [message, setMessage] = useState("");
  const [lastPage, setLastPage] = useState(false);
  const open = () => {
    setMessage(""); dialog.current?.showModal();
  };
  return <Page>
    <small>TAROT TARTE · 미리보기</small>
    <Heading>{lastPage ? <>다음 이야기도<br />함께해요</> : <>오늘의 이야기를<br />간직해 보세요</>}</Heading>
    <Description>{lastPage ? <>타로타르트와 함께한 시간, 어떠셨나요?<br />함께 보고 싶은 사람에게도 알려주세요.</> : <>오늘의 이야기를 정성껏 포장해 드릴게요.<br />간직하고 싶을 때 가져가세요.</>}</Description>
    <Actions hidden={lastPage}>
      <label><input type="checkbox" /> 내 질문 포함</label>
      <button onClick={open}>PDF 저장하기</button>
      <button onClick={open}>이미지 저장하기</button>
    </Actions>
    <Actions hidden={!lastPage}>
      <ShareButton onClick={() => setMessage("타로타르트 소문내기 · 공유 기능은 연결 전이에요.")}>타로타르트 소문내기</ShareButton>
      <a href="/">홈으로</a>
    </Actions>
    {message && <Note role="status">{message}</Note>}
    <Navigation aria-label="미리보기 페이지 이동">
      <button disabled={!lastPage} onClick={() => { setLastPage(false); setMessage(""); }}>이전</button>
      <span aria-live="polite">{lastPage ? "2 / 2" : "1 / 2"}</span>
      <button disabled={lastPage} onClick={() => { setLastPage(true); setMessage(""); }}>다음</button>
    </Navigation>
    <Modal ref={dialog} aria-labelledby="package-title">
      <Close aria-label="팝업 닫기" onClick={() => dialog.current?.close()}>×</Close>
      <Eyebrow>마음을 담아, 소중하게</Eyebrow>
      <h2 id="package-title">타르트 포장이<br />완료되었습니다.</h2>
      <Artwork src="/images/bakery/packed-tart.png" alt="달과 별 카드가 꽂힌 베리 타르트를 담은 크림색 포장상자" />
      <Caption>당신의 이야기를 포장했어요</Caption>
      <Take onClick={() => { dialog.current?.close(); setMessage("가져가기 버튼 시연 완료 · 실제 저장은 연결 전이에요."); }}>가져가기</Take>
    </Modal>
  </Page>;
}

const enter = keyframes`from {opacity:0; transform:translateY(18px) scale(.97)} to {opacity:1; transform:translateY(0) scale(1)}`;
const Page = styled.main`
  min-height:100dvh; box-sizing:border-box; padding:72px 22px 32px;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  background:radial-gradient(ellipse at top,#254b38,#071f18 70%); color:#fff5dd;
  text-align:center; small{font-size:11px;letter-spacing:2px;color:#d4b979;}
`;
const Heading = styled.h1`font-family:"NotoSerifKR",serif;font-size:clamp(25px,7vw,34px);line-height:1.65;margin:28px 0 12px;`;
const Description = styled.p`font-size:14px;line-height:1.9;color:#c9cfbd;margin:0 0 40px;`;
const Actions = styled.div`
  width:100%;max-width:340px;display:grid;gap:12px;
  &[hidden]{display:none;}
  label{text-align:left;font-size:13px;display:flex;gap:8px;align-items:center;margin-bottom:4px;}
  input{width:18px;height:18px;accent-color:#dfbd71;}
  button,a{box-sizing:border-box;display:flex;align-items:center;justify-content:center;border:1px solid #e7cc8c70;border-radius:14px;min-height:50px;background:#ffffff08;color:#fff0ca;font:inherit;cursor:pointer;text-decoration:none;}
`;
const ShareButton = styled.button`
  && {
    background: #fee500;
    color: #191919;
    border-color: #fee500;
    font-weight: 700;
  }
  &:focus-visible { outline: 3px solid #fff6dc; outline-offset: 3px; }
`;
const Navigation = styled.nav`
  display:flex;align-items:center;justify-content:space-between;gap:16px;width:100%;max-width:340px;margin-top:20px;
  span{font-size:12px;color:#d4b979;}
  button{min-height:44px;padding:8px 20px;border:1px solid #e7cc8c70;border-radius:12px;background:transparent;color:#fff0ca;font:inherit;cursor:pointer;}
  button:disabled{opacity:.3;cursor:default;}
`;
const Note = styled.p`max-width:340px;min-height:40px;color:#c1c6b6;font-size:11px;line-height:1.6;margin-top:24px;`;
const Modal = styled.dialog`
  box-sizing:border-box;width:calc(100% - 32px);max-width:360px;max-height:calc(100dvh - 32px);
  margin:auto;padding:36px 24px 24px;border:1px solid #d8bf8a;border-radius:26px;
  background:#fff8e9;color:#214433;text-align:center;overflow-y:auto;
  box-shadow:0 24px 80px #0005;
  &::backdrop{background:#03150fbb;backdrop-filter:blur(4px);}
  &[open]{animation:${enter} 280ms ease-out;}
  h2{font-family:"NotoSerifKR",serif;font-size:clamp(21px,6vw,26px);line-height:1.6;letter-spacing:-.6px;margin:10px 0 0;word-break:keep-all;}
  button:focus-visible{outline:2px solid #8f6e29;outline-offset:4px;}
  @media(max-width:319px){padding:34px 16px 20px;}
  @media(prefers-reduced-motion:reduce){&[open]{animation:none;}}
`;
const Close = styled.button`position:absolute;right:10px;top:10px;width:36px;height:36px;border:0;background:transparent;color:#6d7968;font-size:25px;cursor:pointer;`;
const Eyebrow = styled.p`margin:0;color:#947942;font-size:11px;letter-spacing:1.5px;`;
const Artwork = styled.img`display:block;width:min(100%,244px);height:auto;max-height:32dvh;object-fit:contain;margin:14px auto 8px;`;
const Caption = styled.p`margin:0 0 22px;font-size:12px;color:#717a68;line-height:1.7;`;
const Take = styled.button`width:100%;min-height:50px;border:1px solid #dab968;border-radius:14px;background:linear-gradient(120deg,#f1d48c,#e5bd65);color:#244633;font:inherit;font-size:16px;font-weight:700;cursor:pointer;span{margin-left:8px;}`;
