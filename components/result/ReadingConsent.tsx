"use client";

import Link from "next/link";
import styled from "styled-components";

export default function ReadingConsent({ onConfirm }: { onConfirm: () => void }) {
  return <Notice>
    <h2>질문에 맞는 이야기를 풀어볼게요</h2>
    <p>해설을 만들기 위해 질문 내용과 분석 결과, 뽑은 카드를 Google Gemini에 전달해요.</p>
    <p>무료 API에 보낸 내용은 Google의 제품 개선에 사용되거나 사람이 검토할 수 있어요. 개인정보·민감하거나 비밀인 내용은 보내지 마세요. 지금은 가상의 고민으로 체험해주세요.</p>
    <button type="button" onClick={onConfirm}>가상 질문임을 확인하고 해설 보기</button>
    <Link href="/topic">질문 수정하기</Link>
  </Notice>;
}

const Notice = styled.section`
  width: min(100%, 480px); margin: auto; padding: 28px 18px; border-radius: 18px;
  background: #fff9e8; color: #294d40; line-height: 1.7; overflow-wrap: anywhere;
  h2 { font-size: 1.2rem; }
  p { font-size: 0.9rem; }
  button { display: block; width: 100%; min-height: 44px; padding: 12px; border: 0; border-radius: 12px; background: #294d40; color: #fff9e8; cursor: pointer; }
  a { display: block; margin-top: 12px; text-align: center; }
`;
