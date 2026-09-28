"use client";
import { useRef, useState } from "react";
import styled from "styled-components";
import { useAuth } from "@/components/auth/AuthProvider";
import { invalidateDashboard } from "@/util/accountDashboardCache";
import { useReadingSessionStore } from "@/store/useReadingSessionStore";
import { prepareAccountReadings, type QuestionSaveMode } from "@/util/prepareAccountReadings";
export default function SaveToAccount() {
  const { account } = useAuth();
  const session = useReadingSessionStore();
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<QuestionSaveMode | null>(null);
  if (!account || !session.history.length || !session.consultationId) return null;
  const saved = session.accountSavedRevision >= session.history.length;
  const save = async (questionMode: QuestionSaveMode) => {
    if (busy || saved) return;
    setBusy(true); setMessage("");
    const id = session.consultationId; const revision = session.history.length;
    try {
      const readings = prepareAccountReadings(session.history.map(entry => entry.data), questionMode);
      const response = await fetch("/api/consultations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ consultationId: id, revision, questionMode, readings }) });
      if (!response.ok) throw new Error();
      invalidateDashboard(account.id);
      dialog.current?.close();
      if (useReadingSessionStore.getState().consultationId === id) { useReadingSessionStore.getState().markAccountSaved(revision); setMessage("내 타로 기록에 저장했어요."); }
    } catch { setMessage("저장하지 못했어요. 로그인 상태를 확인하고 다시 눌러주세요."); }
    finally { setBusy(false); }
  };
  return <Box><button type="button" disabled={busy || saved} onClick={() => { if (account.role === "super") { setMode(null); setMessage(""); dialog.current?.showModal(); } else { void save("original"); } }}>{busy ? "기록에 담고 있어요…" : saved ? "내 기록에 저장됨" : "내 기록에 저장"}</button>
    <small>{account.role === "super" ? "자동으로 저장되지 않아요. 저장할 때 질문 포함 방식을 고를 수 있어요." : "누르면 질문·뽑은 카드·해설 전체가 내 계정에 저장돼요."}<br />아래 ‘내 질문 포함’은 내려받는 파일에만 적용돼요.</small>
    <SaveDialog ref={dialog} aria-labelledby="account-save-title" onCancel={event => { if (busy) event.preventDefault(); }}>
      <h2 id="account-save-title">어떻게 담아둘까요?</h2>
      <p>처음 상담부터 연계 상담까지 함께 저장해요.</p>
      <fieldset disabled={busy}><legend>질문 저장 방식</legend>
        <label><input type="radio" name="question-save-mode" checked={mode === "original"} onChange={() => setMode("original")} /><span><strong>질문 원문 포함</strong><small>작성한 질문과 카드, 해설을 함께 보관해요.</small></span></label>
        <label><input type="radio" name="question-save-mode" checked={mode === "keywords"} onChange={() => setMode("keywords")} /><span><strong>질문 대신 키워드</strong><small>질문 원문을 빼고 키워드와 카드, 해설을 보관해요.</small></span></label>
      </fieldset>
      <p className="note">해설은 그대로 저장되어 질문 내용이 일부 담겨 있을 수 있어요.</p>
      {message && <p role="status">{message}</p>}
      <button type="button" disabled={!mode || busy} onClick={() => { if (mode) void save(mode); }}>{busy ? "저장하고 있어요…" : "이대로 저장하기"}</button>
      <button className="cancel" type="button" disabled={busy} onClick={() => dialog.current?.close()}>저장하지 않을래요</button>
    </SaveDialog>
    {message && <p role="status">{message}</p>}</Box>;
}
const Box = styled.div`display:grid;gap:9px;width:100%;margin-bottom:12px;button{width:100%;min-height:48px;padding:12px;border:1px solid #edcf8a;border-radius:12px;background:#edcf8a;color:#173f31;font-weight:700;cursor:pointer;}button:disabled{opacity:.6;cursor:default;}small,p{font-size:11px;line-height:1.8;color:#c9cfbd;}p{font-size:13px;}`;
const SaveDialog = styled.dialog`
  width:calc(100% - 28px);max-width:380px;max-height:90dvh;box-sizing:border-box;margin:auto;padding:22px 16px;border:1px solid #edcf8a80;border-radius:20px;background:#12382b;color:#fff7df;overflow:auto;
  &::backdrop{background:#000a;}h2{font-size:21px;margin:0 0 10px;}fieldset{border:0;padding:0;margin:18px 0;}legend{font-size:13px;margin-bottom:8px;}
  label{display:flex;align-items:flex-start;gap:10px;padding:12px;border:1px solid #edcf8a50;border-radius:12px;cursor:pointer;}label+label{margin-top:8px;}label:has(input:checked){background:#edcf8a18;border-color:#edcf8a;}input{margin-top:4px;accent-color:#edcf8a;flex-shrink:0;}span{min-width:0;}strong{display:block;font-size:15px;}small{display:block;margin-top:4px;}
  .note{margin-bottom:16px;}button+button{margin-top:8px;}&& .cancel{background:transparent;color:#e4ddca;border-color:transparent;}button:focus-visible,input:focus-visible{outline:2px solid #fff7df;outline-offset:3px;}
`;
