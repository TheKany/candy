"use client";
import { useRef, useState } from 'react';
import styled from 'styled-components';

export default function SheetExchange({ premium, available, onExchanged }: { premium: number; available: boolean; onExchanged: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const requestId = useRef<string | null>(null);
  const locked = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const exchange = async () => {
    if (locked.current) return;
    locked.current = true; setBusy(true); setError('');
    requestId.current ??= crypto.randomUUID();
    try {
      const response = await fetch('/api/account/sheets/exchange', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({requestId:requestId.current}) });
      const body = await response.json();
      if (!response.ok) {
        if (response.status === 409) requestId.current = null;
        throw new Error(body.error || '교환하지 못했어요. 다시 시도해주세요.');
      }
      requestId.current = null;
      dialog.current?.close();
      setMessage('고급 시트 1장을 기본 시트 2장으로 교환했어요.');
      onExchanged();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '연결을 확인하고 다시 시도해주세요.');
    } finally { locked.current=false; setBusy(false); }
  };
  return <Box>
    <div><h2>시트 교환소</h2><p>고급 시트 1장 <span aria-hidden="true">→</span> 기본 시트 2장</p></div>
    <button className="exchange" disabled={!available || premium<1 || busy} onClick={()=>{setMessage('');setError('');dialog.current?.showModal();}}>교환하기</button>
    <small>{!available?'교환소 준비 중':premium<1?'고급 시트가 생기면 교환할 수 있어요.':'기본 시트로 바꾼 뒤에는 되돌릴 수 없어요.'}</small>
    {message&&<p role="status">{message}</p>}
    <dialog ref={dialog} onCancel={event=>{if(busy)event.preventDefault();}} aria-labelledby="sheet-exchange-title">
      <h2 id="sheet-exchange-title">시트를 교환할까요?</h2>
      <p>고급 시트 1장을<br/>기본 시트 2장으로 교환해요.</p>
      <small>교환 후에는 되돌릴 수 없어요.</small>
      {error&&<p role="alert">{error}</p>}
      <div className="buttons"><button disabled={busy} onClick={()=>dialog.current?.close()}>아니요</button><button disabled={busy} onClick={exchange}>{busy?'교환 중…':'교환할게요'}</button></div>
    </dialog>
  </Box>;
}
const Box=styled.section`
  display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:16px 0;padding:16px;
  border:1px solid #edcf8a60;border-radius:14px;background:#ffffff06;
  h2{font-size:15px;margin:0;}p{font-size:12px;line-height:1.8;margin:7px 0 0;color:#e5dbc1;}
  >small{flex-basis:100%;font-size:11px;line-height:1.7;color:#bdcbbd;}
  button{font:inherit;font-size:12px;min-height:44px;padding:10px 14px;border-radius:10px;cursor:pointer;}
  .exchange{margin-left:auto;background:#edcf8a;color:#173b2c;}button:disabled{opacity:.4;cursor:default;}
  dialog{margin:auto;width:calc(100% - 32px);max-width:360px;max-height:calc(100dvh - 32px);overflow-y:auto;padding:24px;border:1px solid #edcf8a70;border-radius:18px;background:#123b2b;color:#fff7df;}
  dialog::backdrop{background:#03150fcc;}dialog small{display:block;margin-top:10px;color:#bdcbbd;font-size:12px;}
  .buttons{display:flex;gap:10px;margin-top:22px;}.buttons button{flex:1;background:#ffffff12;color:#fff7df;}.buttons button:last-child{background:#edcf8a;color:#173b2c;}
`;
