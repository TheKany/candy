"use client";
import { useId, useRef, useState } from 'react';
import styled from 'styled-components';

export default function DeleteRecordButton({onDelete}:{onDelete:()=>Promise<void>}) {
  const dialog=useRef<HTMLDialogElement>(null);
  const titleId=useId();
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const submit=async()=>{
    if(busy)return;
    setBusy(true);setError('');
    try{await onDelete();dialog.current?.close();}
    catch{setError('기록을 삭제하지 못했어요. 잠시 후 다시 시도해주세요.');}
    finally{setBusy(false);}
  };
  return <>
    <Trash type="button" aria-label="상담 기록 삭제" onClick={()=>{setError('');dialog.current?.showModal();}}>
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></svg>
    </Trash>
    <Confirm ref={dialog} aria-labelledby={titleId} onCancel={e=>{if(busy)e.preventDefault();}}>
      <h2 id={titleId}>해당 기록을 삭제하시겠습니까?</h2>
      <p>처음 질문과 연계 질문의 카드·해설을 함께 삭제해요.<br/>타로를 본 날짜와 이용 횟수는 남아요.<br/>삭제한 내용은 복구할 수 없어요.</p>
      {error&&<p role="alert" className="error">{error}</p>}
      <div><button type="button" disabled={busy} autoFocus onClick={()=>dialog.current?.close()}>아니오</button><button type="button" className="yes" disabled={busy} onClick={submit}>{busy?'삭제 중…':'예'}</button></div>
    </Confirm>
  </>;
}
const Trash=styled.button`
  display:inline-flex;align-items:center;justify-content:center;min-width:44px;min-height:44px;padding:10px;border:0;border-radius:10px;background:#d9807810;color:#e3978d;cursor:pointer;
  &:hover{background:#d9807825;} &:focus-visible{outline:2px solid #e3978d;outline-offset:2px;}
`;
const Confirm=styled.dialog`
  box-sizing:border-box;width:calc(100% - 32px);max-width:360px;margin:auto;padding:24px 20px;border:1px solid #d9bf8060;border-radius:18px;background:#173b2d;color:#fff3d7;box-shadow:0 16px 60px #0006;
  &::backdrop{background:#0009;}h2{font-size:18px;line-height:1.6;margin:0 0 14px;}p{font-size:13px;line-height:1.85;color:#bdcbbd;margin:0 0 20px;}.error{color:#edb0a4;}div{display:flex;gap:10px;}button{flex:1;min-height:44px;border:1px solid #d9bf8050;border-radius:10px;background:transparent;color:#f5e8cc;font:inherit;cursor:pointer;}button.yes{background:#ba645b;border-color:#ba645b;color:white;}button:disabled{opacity:.6;}button:focus-visible{outline:2px solid #efd18c;outline-offset:3px;}
`;
