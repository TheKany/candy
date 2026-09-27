"use client";
import { useState } from "react";
import styled from "styled-components";
import { useAuth } from "@/components/auth/AuthProvider";
import { useReadingSessionStore } from "@/store/useReadingSessionStore";
export default function SaveToAccount() {
  const { account } = useAuth();
  const session = useReadingSessionStore();
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  if (account?.role !== "member" || !session.history.length || !session.consultationId) return null;
  const saved = session.accountSavedRevision >= session.history.length;
  const save = async () => {
    if (busy || saved) return;
    setBusy(true); setMessage("");
    const id = session.consultationId; const revision = session.history.length;
    try {
      const response = await fetch("/api/consultations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ consultationId: id, revision, readings: session.history.map(entry => entry.data) }) });
      if (!response.ok) throw new Error();
      if (useReadingSessionStore.getState().consultationId === id) { useReadingSessionStore.getState().markAccountSaved(revision); setMessage("내 타로 기록에 저장했어요."); }
    } catch { setMessage("저장하지 못했어요. 로그인 상태를 확인하고 다시 눌러주세요."); }
    finally { setBusy(false); }
  };
  return <Box><button type="button" disabled={busy || saved} onClick={save}>{busy ? "기록에 담고 있어요…" : saved ? "내 기록에 저장됨" : "내 기록에 저장"}</button>
    <small>누르면 질문·뽑은 카드·해설 전체가 내 계정에 저장돼요.<br />아래 ‘내 질문 포함’은 내려받는 파일에만 적용돼요.</small>
    {message && <p role="status">{message}</p>}</Box>;
}
const Box = styled.div`display:grid;gap:9px;width:100%;margin-bottom:12px;button{width:100%;min-height:48px;padding:12px;border:1px solid #edcf8a;border-radius:12px;background:#edcf8a;color:#173f31;font-weight:700;cursor:pointer;}button:disabled{opacity:.6;cursor:default;}small,p{font-size:11px;line-height:1.8;color:#c9cfbd;}p{font-size:13px;}`;
