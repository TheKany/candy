"use client";
import { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useAuth } from "./AuthProvider";
export default function SuperWelcome() {
  const { account, refreshAccount } = useAuth();
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const show = account?.role === "super" && !account.superNoticeAcknowledged;
  useEffect(() => { if (show) dialog.current?.showModal(); else dialog.current?.close(); }, [show]);
  const confirm = async () => {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/account/super-notice", { method: "POST" });
      if (!response.ok) throw new Error();
      await refreshAccount();
    } catch { setError("확인을 저장하지 못했어요. 다시 눌러주세요."); }
    finally { setBusy(false); }
  };
  return <Popup ref={dialog} aria-labelledby="super-welcome-title" onCancel={event => event.preventDefault()}>
    {show && <div aria-hidden="true" className="confetti">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ left: `${(i * 17) % 100}%`, animationDelay: `${i * .06}s`, background: ["#e7ba59", "#5aaf82", "#e9908e"][i % 3] }} />)}</div>}
    <span aria-hidden="true">✦</span><h2 id="super-welcome-title">SUPER ACCOUNT!!</h2>
    <p>작성하신 질문과 타로 해설은 별도로 저장하지 않아요.<br />안심하고 마음껏 무료로 즐겨주세요.</p>
    {error && <p role="alert">{error}</p>}<button type="button" disabled={busy} onClick={confirm}>{busy ? "확인 중…" : "확인"}</button>
  </Popup>;
}
const burst = keyframes`0%{transform:translateY(-60px) rotate(0);opacity:0;}15%{opacity:1;}100%{transform:translateY(340px) rotate(540deg);opacity:0;}`;
const Popup = styled.dialog`
  width:calc(100% - 28px);max-width:380px;max-height:90dvh;box-sizing:border-box;margin:auto;padding:36px 22px 24px;border:1px solid #e7ba59;border-radius:26px;background:#fff8e9;color:#214433;text-align:center;overflow:auto;
  &::backdrop{background:#03150fcc;backdrop-filter:blur(5px);}h2{font-size:clamp(18px,5.5vw,25px);margin:16px 0;}p{font-size:14px;line-height:1.9;word-break:keep-all;}
  > span{font-size:40px;color:#d8a940;}button{position:relative;width:100%;min-height:48px;margin-top:20px;border:0;border-radius:12px;background:#edcf8a;color:#173f31;font-weight:700;cursor:pointer;}
  .confetti{position:absolute;inset:0;pointer-events:none;overflow:hidden;}i{position:absolute;top:0;width:7px;height:14px;animation:${burst} 1.8s ease-out both;}
  @media(prefers-reduced-motion:reduce){i{animation:none;display:none;}}
`;
