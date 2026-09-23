"use client";

import { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { detectInstallBrowser } from "@/util/pwaInstallGuide";

export default function InstallGuide() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android">("ios");
  const [kakao, setKakao] = useState(false);

  useEffect(() => {
    const browser = detectInstallBrowser(navigator.userAgent, navigator.maxTouchPoints);
    setPlatform(browser.platform);
    setKakao(browser.kakao);
    const display = window.matchMedia("(display-mode: standalone)");
    const update = () => {
      const installed = display.matches
        || (navigator as Navigator & { standalone?: boolean }).standalone === true;
      setVisible(!installed);
      if (installed) dialog.current?.close();
    };
    update();
    display.addEventListener("change", update);
    return () => display.removeEventListener("change", update);
  }, []);

  if (!visible) return null;

  return (
    <>
      <GuideButton type="button" onClick={() => dialog.current?.showModal()} aria-haspopup="dialog">
        <span aria-hidden>＋</span> 앱으로 더 편하게 이용하기 <span aria-hidden>›</span>
      </GuideButton>
      <Sheet ref={dialog} aria-labelledby="install-guide-title" onClick={(event) => {
        if (event.target === event.currentTarget) {
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right
            || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.current?.close();
        }
      }}>
        <Header>
          <div><small>내 손안의 타로타르트</small><h2 id="install-guide-title">홈 화면에서 만나요</h2></div>
          <Close type="button" aria-label="설치 안내 닫기" onClick={() => dialog.current?.close()}>×</Close>
        </Header>
        <Intro>홈 화면에 추가하고, 아이콘을 눌러 바로 찾아오세요.</Intro>
        {kakao && <Notice>카카오톡 안에서 보고 계시네요.<br />카카오톡 메뉴에서 외부 브라우저로 열거나, 주소를 복사해 Safari 또는 Chrome에서 열어주세요.</Notice>}
        <Choices aria-label="설치 안내 기기 선택">
          <Choice type="button" $active={platform === "ios"} aria-pressed={platform === "ios"} onClick={() => setPlatform("ios")}>아이폰 · iOS</Choice>
          <Choice type="button" $active={platform === "android"} aria-pressed={platform === "android"} onClick={() => setPlatform("android")}>안드로이드</Choice>
        </Choices>
        <Instructions aria-live="polite">
          {platform === "ios" ? <>
            <li><strong>Safari에서 타로타르트를 열어요</strong><p>다른 앱 안이라면 주소를 복사해 Safari에서 열어주세요.</p></li>
            <li><strong>공유 버튼을 눌러요</strong><p>네모 위로 화살표가 올라가는 모양이에요. 안 보이면 페이지 메뉴에서 ‘공유’를 찾아주세요.</p></li>
            <li><strong>‘홈 화면에 추가’를 선택해요</strong><p>‘웹 앱으로 열기’가 보이면 켜고, ‘추가’를 눌러주세요.</p></li>
          </> : <>
            <li><strong>Chrome에서 타로타르트를 열어요</strong><p>다른 앱 안이라면 주소를 복사해 Chrome에서 열어주세요.</p></li>
            <li><strong>오른쪽 위 ⋮ 메뉴를 눌러요</strong><p>‘홈 화면에 추가’ 또는 ‘앱 설치’를 찾아주세요.</p></li>
            <li><strong>‘설치’를 눌러 마무리해요</strong><p>확인창의 안내를 따르면 홈 화면에서 타로타르트를 열 수 있어요.</p></li>
          </>}
        </Instructions>
        <Footnote>기기와 브라우저 버전에 따라 메뉴 이름이 조금 다를 수 있어요.</Footnote>
        <Done type="button" onClick={() => dialog.current?.close()}>알겠어요</Done>
      </Sheet>
    </>
  );
}

const GuideButton = styled.button`
  position: relative; z-index: 1; display: flex; align-items: center; justify-content: center;
  gap: 8px; width: 100%; min-height: 44px; margin: 0 0 10px; padding: 10px 8px;
  border: 1px solid rgb(247 218 131 / 25%); border-radius: 14px;
  background: rgb(255 247 223 / 5%); color: #f5dfaa; font: inherit;
  font-size: clamp(0.75rem, 3.3vw, 0.88rem); cursor: pointer;
  &:focus-visible { outline: 2px solid #f7da83; outline-offset: 3px; }
`;
const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
const Sheet = styled.dialog`
  box-sizing: border-box; position: fixed; inset: auto 0 0;
  width: min(100%, 440px); max-width: 100%; max-height: 90dvh;
  margin: auto auto 0; overflow-y: auto; overscroll-behavior: contain;
  padding: 24px 22px calc(20px + env(safe-area-inset-bottom));
  border: 1px solid #d5bd82; border-bottom: 0; border-radius: 24px 24px 0 0;
  background: #fff8e8; color: #234536; box-shadow: 0 -10px 50px #0004;
  font-family: inherit; word-break: keep-all; overflow-wrap: anywhere;
  &::backdrop { background: rgb(1 17 12 / 65%); }
  &[open] { animation: ${slideUp} 320ms cubic-bezier(0.22, 1, 0.36, 1); }
  &[open]::backdrop { animation: ${fadeIn} 240ms ease-out; }
  @media (prefers-reduced-motion: reduce) {
    &[open], &[open]::backdrop { animation: none; }
  }
  button:focus-visible { outline: 2px solid #8c6725; outline-offset: 3px; }
  @media (max-width: 319px) { padding: 20px 14px calc(16px + env(safe-area-inset-bottom)); }
`;
const Header = styled.div`
  display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;
  small { color: #8b6c34; font-size: 0.75rem; }
  h2 { margin: 7px 0 0; font-family: "NotoSerifKR", serif; font-size: clamp(1.15rem, 5vw, 1.45rem); }
`;
const Close = styled.button`
  flex-shrink: 0; width: 40px; height: 40px; border: 0; border-radius: 50%;
  background: #eae3ce; color: #234536; font-size: 1.5rem; cursor: pointer;
`;
const Intro = styled.p`font-size: 0.86rem; line-height: 1.65; margin: 14px 0 20px;`;
const Notice = styled.p`
  padding: 12px; border-radius: 12px; background: #f5e7be; font-size: 0.82rem; line-height: 1.7;
`;
const Choices = styled.div`display: flex; gap: 8px;`;
const Choice = styled.button<{ $active: boolean }>`
  flex: 1; min-width: 0; min-height: 44px; padding: 8px 4px; border-radius: 12px;
  border: 1px solid ${({ $active }) => $active ? "#234536" : "#d7ceb6"};
  background: ${({ $active }) => $active ? "#234536" : "transparent"};
  color: ${({ $active }) => $active ? "#fff3cc" : "#526257"};
  font: inherit; font-size: 0.84rem; cursor: pointer;
`;
const Instructions = styled.ol`
  padding-left: 24px; margin: 22px 0; font-size: 0.88rem;
  li { padding-left: 3px; margin-bottom: 20px; line-height: 1.6; }
  li::marker { color: #997534; font-weight: 700; }
  p { margin: 5px 0 0; color: #647063; font-size: 0.8rem; }
`;
const Footnote = styled.p`color: #737967; font-size: 0.73rem; line-height: 1.6;`;
const Done = styled.button`
  width: 100%; min-height: 46px; margin-top: 8px; border: 0; border-radius: 12px;
  background: #234536; color: #fff3cc; font: inherit; cursor: pointer;
`;
