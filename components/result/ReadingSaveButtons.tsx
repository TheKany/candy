"use client";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import type { ReadingExport } from "@/util/readingExportLayout";

export default function ReadingSaveButtons({ data }: { data: ReadingExport }) {
  const [include, setInclude] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<{ url: string; name: string; image: boolean }[]>([]);
  const urls = useRef<string[]>([]);
  const working = useRef(false);
  const mounted = useRef(true);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (files.length) dialog.current?.showModal(); }, [files]);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; urls.current.forEach(URL.revokeObjectURL); }; }, []);
  const clear = () => { urls.current.forEach(URL.revokeObjectURL); urls.current = []; setFiles([]); };
  const prepare = async (format: "pdf" | "image") => {
    if (working.current) return;
    working.current = true; setBusy(true); setError(""); clear();
    try {
      const { renderReadingExport, createReadingPdf } = await import("@/util/renderReadingExport");
      const images = await renderReadingExport(data, include, format === "pdf" ? "jpeg" : "png");
      const blobs = format === "pdf" ? [await createReadingPdf(images)] : images;
      if (!mounted.current) return;
      const name = `타로타르트-${new Date().toISOString().slice(0, 10)}`;
      const items = blobs.map((blob, i) => ({ url: URL.createObjectURL(blob), name: `${name}-${i + 1}.${format === "pdf" ? "pdf" : "png"}`, image: format === "image" }));
      urls.current = items.map(item => item.url); setFiles(items);
    } catch { if (mounted.current) setError("파일을 만들지 못했어요. 다시 눌러주세요."); }
    finally { working.current = false; if (mounted.current) setBusy(false); }
  };
  return <Box>
    <Intro>오늘의 이야기를 정성껏 포장해 드릴게요.<br />간직하고 싶을 때 가져가세요.</Intro>
    {data.question && <label><input type="checkbox" checked={include} disabled={busy} onChange={event => { setInclude(event.target.checked); clear(); }} />내 질문 포함</label>}
    <button type="button" disabled={busy} onClick={() => prepare("pdf")}>PDF 저장하기</button>
    <button type="button" disabled={busy} onClick={() => prepare("image")}>이미지 저장하기</button>
    {busy && <p role="status">해설을 파일로 담고 있어요…</p>}
    {error && <p role="alert">{error}</p>}
    <PackageDialog ref={dialog} aria-labelledby="reading-package-title" onClose={clear}>
      <button className="close" type="button" aria-label="팝업 닫기" onClick={() => dialog.current?.close()}>×</button>
      <small>마음을 담아, 소중하게</small>
      <h2 id="reading-package-title">타르트 포장이<br />완료되었습니다.</h2>
      <img src="/images/bakery/packed-tart.png" alt="타르트를 담은 크림색 포장상자" />
      <p>당신의 이야기를 포장했어요</p>
      {files.map((file, i) => <a key={file.url} href={file.url} download={file.name}>
        가져가기{files.length > 1 ? ` · ${i + 1} / ${files.length}` : ""}
      </a>)}
    </PackageDialog>
  </Box>;
}

const Box = styled.div`
  display:grid;gap:10px;width:100%;min-width:0;margin:12px 0;
  label{display:flex;align-items:center;gap:9px;font-size:13px;color:#fff1cd;padding:8px 0;}
  input{width:18px;height:18px;accent-color:#edcf8a;}
  button,a{display:block;box-sizing:border-box;width:100%;min-height:46px;padding:12px 8px;border:1px solid #edcf8a66;border-radius:12px;background:#ffffff08;color:#fff1cd;text-align:center;font-size:14px;line-height:1.6;cursor:pointer;}
  button:disabled{opacity:.5;cursor:wait;}p{font-size:13px;line-height:1.7;}
  article{margin-bottom:16px;}img{width:100%;height:auto;display:block;border-radius:8px;margin-bottom:8px;}
  a{background:#edcf8a;color:#173f31;}.open{background:transparent;color:#fff1cd;margin-top:6px;}
  button:focus-visible,a:focus-visible,input:focus-visible{outline:2px solid #edcf8a;outline-offset:3px;}
`;

const Intro = styled.p`text-align:center;color:#c9cfbd;line-height:1.9;margin:0 0 18px;word-break:keep-all;`;
const PackageDialog = styled.dialog`
  box-sizing:border-box;width:calc(100% - 32px);max-width:360px;max-height:calc(100dvh - 32px);
  margin:auto;padding:36px 24px 24px;border:1px solid #d8bf8a;border-radius:26px;
  background:#fff8e9;color:#214433;text-align:center;overflow-y:auto;box-shadow:0 24px 80px #0005;
  &::backdrop{background:#03150fbb;backdrop-filter:blur(4px);}
  small{color:#947942;font-size:11px;letter-spacing:1.5px;}
  h2{font-family:"NotoSerifKR",serif;font-size:clamp(21px,6vw,26px);line-height:1.6;margin:10px 0 0;}
  && img{width:min(100%,244px);height:auto;max-height:32dvh;object-fit:contain;margin:14px auto 8px;}
  p{color:#717a68;margin:0 0 22px;}
  && a{margin-top:10px;background:linear-gradient(120deg,#f1d48c,#e5bd65);color:#244633;text-decoration:none;font-weight:700;}
  && .close{position:absolute;right:10px;top:10px;width:36px;min-height:36px;padding:0;border:0;background:transparent;color:#6d7968;font-size:25px;}
  @media(max-width:319px){padding:34px 16px 20px;}
`;
