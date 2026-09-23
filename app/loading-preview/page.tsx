"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styled from "styled-components";
import TartOvenStatus from "@/components/result/TartOvenStatus";
import { isReadingFailureCode, type ReadingFailureCode } from "@/util/readingFailure";

const errorOptions: { code: ReadingFailureCode; label: string }[] = [
  { code: "busy", label: "일시적 서버 오류" },
  { code: "quota", label: "사용 한도 초과" },
  { code: "daily_quota", label: "하루 한도 소진" },
  { code: "configuration", label: "서비스 설정 오류" },
  { code: "timeout", label: "응답 시간 초과" },
  { code: "network", label: "네트워크 연결 오류" },
  { code: "incomplete", label: "해설 미완성" },
  { code: "blocked", label: "응답 정책 제한" },
  { code: "unknown", label: "기타 오류" },
];

export default function LoadingPreviewPage() {
  const router = useRouter();
  const [error, setError] = useState<ReadingFailureCode | null>(null);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("mode") === "error") setError("busy");
  }, []);
  return <Preview>
    <Bar>
      <Link href="/select">← 타로 선택으로</Link>
      <span>미리보기 · AI 호출 없음</span>
    </Bar>
    <Controls>
      <div>
        <button type="button" aria-pressed={!error} onClick={() => setError(null)}>로딩화면 보기</button>
        <button type="button" aria-pressed={!!error} onClick={() => setError("busy")}>오류화면 보기</button>
      </div>
      {error && <label>오류 종류
        <select value={error} onChange={(event) => { if (isReadingFailureCode(event.target.value)) setError(event.target.value); }}>
          {errorOptions.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}
        </select>
      </label>}
    </Controls>
    <TartOvenStatus error={error} onRetry={() => setError(null)} onHome={() => router.push("/select")} />
  </Preview>;
}

const Preview = styled.main`
  background: #0b2d24;
  > section { min-height: calc(100dvh - 58px); }
`;
const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 4px 12px;
  min-height: 58px;
  padding: 7px 16px;
  color: #edcf8a;
  background: #0b2d24;
  border-bottom: 1px solid #edcf8a30;
  a { display: flex; align-items: center; min-height: 44px; font-size: 13px; }
  span { font-size: 10px; color: #bac9b9; }
`;

const Controls = styled.div`
  padding: 12px 16px;
  color: #edcf8a;
  > div { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  button { min-height: 44px; padding: 8px; border: 1px solid #edcf8a60; border-radius: 10px; color: #edcf8a; font-size: 12px; cursor: pointer; }
  button[aria-pressed="true"] { color: #17392c; background: #edcf8a; }
  label { display: grid; gap: 8px; margin-top: 14px; font-size: 12px; }
  select { width: 100%; min-height: 44px; padding: 8px; border: 1px solid #edcf8a60; border-radius: 10px; background: #17392c; color: #fff5dd; font-size: 16px; }
`;
