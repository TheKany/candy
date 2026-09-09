"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { useQuestionStore } from "@/store/useQuestionStore";
import { useTarotTypeStore } from "@/store/useTarotTypeStore";
import { useTarotTopicStore } from "@/store/useTarotTopicStore";
import { handleResetCardProgress } from "@/util/handleResetStore";

export default function QuestionEntry() {
  const router = useRouter();
  const type = useTarotTypeStore((state) => state.type);
  const [question, setQuestion] = useState("");
  const [consent, setConsent] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const saved = useQuestionStore.getState();
    setQuestion(saved.question);
    setConsent(Boolean(saved.question.trim()) && saved.consentQuestion === saved.question);
    setReady(true);
  }, []);
  useEffect(() => { if (ready && !type) router.replace("/select"); }, [ready, type, router]);
  if (!ready || !type) return null;
  return <Main>
    <Back type="button" onClick={() => router.push("/select")}>← 타로 방식 고르기</Back>
    <h1>어떤 이야기가<br />마음에 걸리나요?</h1>
    <p>질문을 적고 카드를 뽑아보세요.<br />카드가 전하는 이야기를 질문에 맞춰 풀어드릴게요.</p>
    <form onSubmit={(event) => {
      event.preventDefault();
      if (!question.trim() || !consent) return;
      const saved = useQuestionStore.getState();
      saved.save(question.trim(), null);
      saved.consent(question.trim());
      useTarotTopicStore.getState().resetTopic();
      handleResetCardProgress();
      router.push("/shuffle");
    }}>
      <label htmlFor="tarot-question">나의 질문</label>
      <textarea id="tarot-question" required maxLength={1000} value={question}
        placeholder="궁금한 점을 단어가 아닌 문장으로 적어주세요. 지금의 상황을 함께 알려주시면 좋아요."
        aria-describedby="question-help" onChange={(event) => {
          setQuestion(event.target.value); setConsent(false);
          useQuestionStore.getState().save(event.target.value, null);
        }} />
      <Count>{question.length}/1,000</Count>
      <Notice id="question-help">해설을 받을 때 질문과 카드를 Google Gemini에 한 번 전송해요. 무료 API의 내용은 제품 개선이나 사람의 검토에 사용될 수 있어요. 개인정보·민감한 내용은 보내지 말고 가상 질문으로 체험해주세요.</Notice>
      <Consent><input type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>개인정보 없는 가상 질문이며, 전송 안내를 확인했어요.</span></Consent>
      <Button type="submit" disabled={!question.trim() || !consent}>카드 뽑으러 가기 →</Button>
    </form>
  </Main>;
}

const Main = styled.main`
  width: min(100%, 480px); min-height: 100dvh; margin: auto;
  padding: calc(18px + env(safe-area-inset-top)) clamp(16px, 5vw, 28px) calc(28px + env(safe-area-inset-bottom));
  color: #fff7df; background: radial-gradient(circle at 15% 10%, #d4af3720, transparent 35%), #08291f;
  h1 { margin: 32px 0 16px; font-size: clamp(26px, 7vw, 34px); line-height: 1.4; }
  p { line-height: 1.7; color: #fff7dfb0; }
  form { margin-top: 28px; }
  label { display: block; line-height: 1.6; }
  textarea { display: block; width: 100%; min-height: 190px; margin-top: 12px; padding: 16px; resize: vertical; border: 1px solid #f2ce7270; border-radius: 16px; background: #ffffff09; color: #fff7df; font: inherit; font-size: 16px; line-height: 1.7; }
  textarea::placeholder { color: #fff7df75; }
  button, input { font: inherit; }
  button:focus-visible, textarea:focus-visible, input:focus-visible { outline: 2px solid #ffe49b; outline-offset: 3px; }
`;
const Back = styled.button`min-height: 44px; color: #f2ce72; cursor: pointer;`;
const Count = styled.div`margin-top: 6px; text-align: right; color: #fff7df80; font-size: 12px;`;
const Notice = styled.p`margin: 22px 0 14px; font-size: 12px; overflow-wrap: anywhere;`;
const Consent = styled.label`
  display: flex !important; align-items: flex-start; gap: 10px; padding: 10px 0; font-size: 13px;
  input { flex: 0 0 auto; width: 18px; height: 18px; margin-top: 2px; accent-color: #f2ce72; }
`;
const Button = styled.button`
  width: 100%; min-height: 52px; margin-top: 22px; padding: 14px; border-radius: 14px; background: #f2ce72; color: #123a2b; font-weight: 700; cursor: pointer;
  &:disabled { opacity: .4; cursor: default; }
`;
