"use client";
import { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useAuth } from "./AuthProvider";
import { usePathname } from "next/navigation";
export default function SuperWelcome() {
  const { account, refreshAccount } = useAuth();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const confirming = useRef(false);
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    setReady(false); setError("");
    if (pathname === "/account" && account?.id) void refreshAccount().then(success => { if (!cancelled) setReady(success); });
    return () => { cancelled = true; };
  }, [pathname, account?.id, refreshAccount]);
  const show = pathname === "/account" && ready && account?.role === "super" && account.roleVersion !== null && !account.superNoticeAcknowledged;
  useEffect(() => { if (show) dialog.current?.showModal(); else dialog.current?.close(); }, [show]);
  const confirm = async () => {
    if (confirming.current || !account || account.roleVersion === null) return;
    confirming.current = true;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/account/super-notice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ roleVersion: account.roleVersion }) });
      if (response.status === 409) { await refreshAccount(); throw new Error(); }
      if (!response.ok) throw new Error();
      if (!await refreshAccount()) throw new Error();
    } catch { setError("확인을 저장하지 못했어요. 다시 눌러주세요."); }
    finally { confirming.current = false; setBusy(false); }
  };
  return <Popup ref={dialog} aria-labelledby="super-welcome-title" onCancel={event => event.preventDefault()}>
    {show && <div aria-hidden="true" className="confetti">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ left: `${(i * 17) % 100}%`, animationDelay: `${i * .06}s`, background: ["#e7ba59", "#5aaf82", "#e9908e"][i % 3] }} />)}</div>}
    <span aria-hidden="true">✦</span><h2 id="super-welcome-title">SUPER ACCOUNT!!</h2>
    <p>모든 타로를 무료로 즐길 수 있어요.<br />질문과 해설은 자동으로 저장되지 않아요.<br />원할 때만 직접 저장해주세요.</p>
    {error && <p role="alert">{error}</p>}<button type="button" disabled={busy} onClick={confirm}>{busy ? "확인 중…" : "확인했어요"}</button>
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
