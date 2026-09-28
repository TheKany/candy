"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";

type Props = {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

/** A top-layer editor avoids the carousel's transformed/clipped containers. */
export default function QuestionEditor({ id, label, value, placeholder, onChange }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const open = () => {
    dialog.current?.showModal();
    // Focus within the tap event so iOS opens the keyboard without a second tap.
    input.current?.focus({ preventScroll: true });
  };
  const close = () => {
    input.current?.blur();
    dialog.current?.close();
  };

  return <>
    <Preview id={id} type="button" aria-label={`${label} 작성하기`} aria-haspopup="dialog" onClick={open} $empty={!value}>
      {value || placeholder}
    </Preview>
    <Count>{value.length.toLocaleString("ko-KR")} / 1,000자</Count>
    {mounted && createPortal(<Editor ref={dialog} aria-labelledby={titleId}>
      <div className="editor-layout">
        <header>
          <h2 id={titleId}>{label}</h2>
          <button type="button" onClick={close}>작성 완료</button>
        </header>
        <textarea ref={input} aria-label={label} value={value} maxLength={1000}
          placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
        <Count aria-live="off">{value.length.toLocaleString("ko-KR")} / 1,000자</Count>
      </div>
    </Editor>, document.body)}
  </>;
}

const Preview = styled.button<{ $empty: boolean }>`
  && { display:block;width:100%;min-height:116px;max-height:200px;overflow-y:auto;margin-top:12px;padding:16px;
    border:1px solid #f2ce7270;border-radius:14px;background:#ffffff09;
    color:${({$empty})=>$empty ? '#fff7df80' : '#fff7df'};font:inherit;font-size:16px;
    line-height:1.7;text-align:left;white-space:pre-wrap;overflow-wrap:anywhere;cursor:text; }
  &:focus-visible { outline:2px solid #ffe49b;outline-offset:3px; }
`;
const Count = styled.div`margin-top:6px;text-align:right;color:#fff7df80;font-size:12px;`;
const Editor = styled.dialog`
  position:fixed;inset:auto 0;top:var(--app-offset-top,0px);
  width:100%;max-width:480px;height:var(--app-height,100dvh);max-height:none;
  margin:0 auto;padding:0;border:0;background:#08291f;color:#fff7df;overflow:hidden;
  &::backdrop { background:#08291f; }
  .editor-layout { height:100%;min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr) auto;
    gap:10px;padding: max(10px,env(safe-area-inset-top)) 16px max(8px,env(safe-area-inset-bottom)); }
  header { display:flex;align-items:center;justify-content:space-between;gap:12px; }
  h2 { margin:0;font-size:17px;line-height:1.4; }
  header button { flex-shrink:0;min-height:44px;padding:8px 14px;border-radius:12px;
    background:#f2ce72;color:#123a2b;font:inherit;font-size:14px;font-weight:700;cursor:pointer; }
  textarea { display:block;box-sizing:border-box;width:100%;height:100%;min-height:0;min-width:0;
    padding:14px;border:1px solid #f2ce7270;border-radius:14px;background:#ffffff09;
    color:inherit;font:inherit;font-size:16px;line-height:1.7;resize:none;overflow-y:auto;
    overscroll-behavior:contain; }
  textarea::placeholder { color:#fff7df80; }
  textarea:focus-visible,button:focus-visible { outline:2px solid #ffe49b;outline-offset:2px; }
`;
