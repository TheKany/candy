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
    {data.question && <label><input type="checkbox" checked={include} disabled={busy} onChange={event => { setInclude(event.target.checked); clear(); }} />내 질문 포함</label>}
    <button type="button" disabled={busy} onClick={() => prepare("pdf")}>PDF 저장하기</button>
    <button type="button" disabled={busy} onClick={() => prepare("image")}>이미지 저장하기</button>
    {busy && <p role="status">해설을 파일로 담고 있어요…</p>}
    {error && <p role="alert">{error}</p>}
    {!!files.length && <div aria-label="저장할 해설 파일">
      {files.map((file, i) => <article key={file.url}>
        {file.image && <img src={file.url} alt={`저장할 해설 ${i + 1}페이지`} />}
        <a href={file.url} download={file.name}>{file.image ? `${i + 1} / ${files.length} 이미지 저장` : "완성된 PDF 저장"}</a>
        <a className="open" href={file.url} target="_blank" rel="noreferrer">파일 열기</a>
      </article>)}
      <button type="button" onClick={clear}>닫기</button>
    </div>}
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
