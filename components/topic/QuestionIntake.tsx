"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styled, { keyframes } from "styled-components";
import { TAROT_TOPICS, getTarotTopic } from "@/constants/tarotTopics";
import { useTarotTypeStore } from "@/store/useTarotTypeStore";
import { useTarotTopicStore } from "@/store/useTarotTopicStore";
import { useQuestionStore } from "@/store/useQuestionStore";
import { handleResetCardProgress } from "@/util/handleResetStore";
import { QUESTION_INTENTS, type QuestionAnalysis, type QuestionIntent, type RelationshipGoal } from "@/util/analyzeQuestion";

export default function QuestionIntake({ mode = "input" }: { mode?: "input" | "analysis" }) {
  const router = useRouter();
  const type = useTarotTypeStore((state) => state.type);
  const [question, setQuestion] = useState("");
  const [analysis, setAnalysis] = useState<QuestionAnalysis | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => pending.current?.abort(), []);
  useEffect(() => {
    const saved = useQuestionStore.getState();
    setQuestion(saved.question);
    setAnalysis(saved.analysis);
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready && !type) router.replace("/select");
  }, [ready, type, router]);

  const invalidate = () => {
    useQuestionStore.getState().save(question, null);
    useTarotTopicStore.getState().resetTopic();
  };
  const analyze = useCallback(async () => {
    if (!question.trim() || pending.current) return;
    useQuestionStore.getState().save(question, null);
    useTarotTopicStore.getState().resetTopic();
    setAnalysis(null);
    setError("");
    setLoading(true);
    const controller = new AbortController();
    pending.current = controller;
    try {
      const result = await fetch("/api/analyzeQuestion", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }), signal: controller.signal,
      });
      const data = await result.json();
      if (!result.ok) throw new Error(data.error || "질문을 정리하지 못했어요. 다시 시도해주세요.");
      if (pending.current === controller) {
        setAnalysis(data.analysis);
        useQuestionStore.getState().save(question, data.analysis);
      }
    } catch (cause) {
      if (!controller.signal.aborted && pending.current === controller) {
        setError("질문을 정리하지 못했어요. 다시 시도하거나 직접 고민을 선택해주세요.");
      }
    } finally {
      if (pending.current === controller) { setLoading(false); pending.current = null; }
    }
  }, [question]);
  useEffect(() => {
    if (!ready || !type || mode !== "analysis") return;
    if (!question.trim()) { router.replace("/topic"); return; }
    if (useQuestionStore.getState().analysis) return;
    // Defer until after mount so React's development effect replay can cancel it.
    const timer = setTimeout(() => { void analyze(); }, 0);
    return () => {
      clearTimeout(timer);
      pending.current?.abort();
      pending.current = null;
    };
  }, [ready, type, mode, question, router, analyze]);
  const confirm = () => {
    if (!question.trim() || !analysis?.topic || !analysis.intent) return;
    useQuestionStore.getState().save(question.trim(), analysis);
    useTarotTopicStore.getState().setTopic(analysis.topic);
    handleResetCardProgress();
    router.push("/shuffle");
  };
  const relationship = analysis && ["relationships", "their-feelings", "new-love", "relationship-flow"].includes(analysis.topic ?? "");
  if (!ready || !type) return null;

  if (mode === "analysis" && !error && (loading || !analysis)) return <Main>
    <Back type="button" onClick={() => router.replace("/topic")}>← 질문 수정하기</Back>
    <LoadingScene role="status" aria-live="polite" aria-busy="true">
      <Cards aria-hidden="true"><i>☾</i><i>✦</i><i>☾</i></Cards>
      <h1>당신의 이야기를<br />차분히 읽고 있어요</h1>
      <p>마음에 담긴 상황과 궁금한 점을<br />하나씩 정리하고 있어요.</p>
      <Pulse aria-hidden="true"><span /><span /><span /></Pulse>
      <Help>잠시만 기다려주세요. 질문에 따라 시간이 조금 걸릴 수 있어요.</Help>
    </LoadingScene>
  </Main>;

  return <Main>
    <Back type="button" onClick={() => router.push(mode === "input" ? "/select" : "/topic")}>
      {mode === "input" ? "← 타로 방식 고르기" : "← 질문 수정하기"}
    </Back>
    {mode === "input" ? <>
    <h1>어떤 이야기가<br />마음에 걸리나요?</h1>
    <Intro>지금의 상황과 궁금한 점을 편하게 적어주세요.</Intro>
    <form onSubmit={(event) => {
      event.preventDefault();
      if (!question.trim()) return;
      useQuestionStore.getState().save(question.trim(), null);
      useTarotTopicStore.getState().resetTopic();
      router.push("/question-analysis");
    }}>
      <Label htmlFor="tarot-question">나의 질문</Label>
      <TextArea id="tarot-question" value={question} maxLength={1000} required
        placeholder="궁금한 점을 단어가 아닌 문장으로 적어주세요. 지금의 상황을 함께 알려주시면 질문을 이해하는 데 도움이 돼요."
        aria-describedby="question-help"
        onChange={(event) => {
          pending.current?.abort(); pending.current = null; setLoading(false); setError("");
          setQuestion(event.target.value); setAnalysis(null);
          useQuestionStore.getState().save(event.target.value, null);
          useTarotTopicStore.getState().resetTopic();
        }} />
      <Help id="question-help">질문은 분석을 위해 전송되며, 이 앱의 데이터베이스에는 저장하지 않아요. 이름이나 연락처는 빼고 적어주세요. <span>{question.length}/1,000</span></Help>
      <Button type="submit" disabled={!question.trim()}>내 질문 분석하기 →</Button>
    </form>
    </> : <>
    <h1>당신의 고민을<br />이렇게 정리했어요</h1>
    <OriginalQuestion><summary>내가 적은 질문</summary><p>{question}</p></OriginalQuestion>
    {error && <Panel role="alert"><p>{error}</p><Button type="button" onClick={() => {
      setError(""); setAnalysis({ topic: null, intent: null, relationshipGoal: "unspecified", evidence: [] });
    }}>직접 고민 선택하기</Button><Back type="button" onClick={() => { void analyze(); }}>다시 분석하기</Back></Panel>}

    {analysis && <Panel aria-label="질문 분석 확인">
      <h2>이런 고민으로 읽었어요</h2>
      {analysis.summary !== undefined && <>
        <Label htmlFor="question-summary">질문을 풀어쓴 내용</Label>
        <TextArea id="question-summary" maxLength={600} value={analysis.summary} onChange={(event) => {
          invalidate(); setAnalysis({ ...analysis, summary: event.target.value });
        }} />
        <Help>뜻이 다르게 정리됐다면 위 내용을 직접 고쳐주세요.</Help>
      </>}
      {analysis.clarification && <p>{analysis.clarification} ‘질문 수정하기’에서 내용을 보충한 뒤 다시 확인해주세요.</p>}
      <p role="status">{analysis.topic
        ? `${getTarotTopic(analysis.topic)?.title}${analysis.intent ? ` · ${QUESTION_INTENTS.find((item) => item.id === analysis.intent)?.label}` : ""}에 대한 고민인가요?`
        : "질문만으로 주제를 정하기 어려워요. 아래에서 가장 가까운 고민을 골라주세요."}</p>
      <Help>다르게 읽힌 부분은 직접 바꿔주세요.</Help>
      <fieldset><legend>고민 주제</legend><Grid>
        {TAROT_TOPICS.map((topic) => <Choice key={topic.id} type="button"
          $selected={analysis.topic === topic.id} aria-pressed={analysis.topic === topic.id}
          onClick={() => { invalidate(); setAnalysis({ ...analysis, topic: topic.id, relationshipGoal: "unspecified" }); }}>
          {analysis.topic === topic.id && "✓ "}{topic.title}
        </Choice>)}
      </Grid></fieldset>
      <Label htmlFor="question-intent">가장 알고 싶은 것</Label>
      <Select id="question-intent" value={analysis.intent ?? ""} onChange={(event) => {
        invalidate(); setAnalysis({ ...analysis, intent: event.target.value as QuestionIntent || null });
      }}>
        <option value="">직접 골라주세요</option>
        {QUESTION_INTENTS.map((intent) => <option key={intent.id} value={intent.id}>{intent.label}</option>)}
      </Select>
      {relationship && <>
        <Label htmlFor="relationship-goal">어떤 관계로 지내고 싶나요?</Label>
        <Select id="relationship-goal" value={analysis.relationshipGoal} onChange={(event) => {
          invalidate(); setAnalysis({ ...analysis, relationshipGoal: event.target.value as RelationshipGoal });
        }}>
          <option value="unspecified">특별히 정하지 않았어요 / 해당 없어요</option>
          <option value="friendship">친구·동료로 편하게 지내고 싶어요</option>
          <option value="romance">연애 관계로 이어가고 싶어요</option>
        </Select>
        {(["selfMaritalStatus", "otherMaritalStatus"] as const).map((field) => (
          <div key={field}>
            <Label htmlFor={field}>{field === "selfMaritalStatus" ? "나의 결혼 여부" : "상대의 결혼 여부"}</Label>
            <Select id={field} value={analysis[field] ?? "unknown"} onChange={(event) => {
              invalidate(); setAnalysis({ ...analysis, [field]: event.target.value });
            }}>
              <option value="unknown">언급하지 않음 / 알 수 없음</option>
              <option value="married">기혼</option>
              <option value="unmarried">미혼</option>
            </Select>
          </div>
        ))}
      </>}
      <Help>질문이 맞게 정리됐는지 확인해주세요. 카드를 뽑으면 선택한 주제의 해설을 볼 수 있어요.</Help>
      {analysis.topic && analysis.intent && <Button type="button" onClick={confirm}>맞아요, 카드 뽑으러 가기 →</Button>}
    </Panel>}
    </>}
  </Main>;
}

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;
const glow = keyframes`
  0%, 100% { opacity: .3; }
  50% { opacity: 1; }
`;
const LoadingScene = styled.section`
  min-height: calc(100dvh - 140px); display: flex; flex-direction: column;
  align-items: center; justify-content: center; text-align: center;
  h1 { margin-top: 36px; font-size: clamp(24px, 6.5vw, 30px); }
  p { color: #fff7dfb0; font-size: 14px; line-height: 1.8; }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; } }
`;
const Cards = styled.div`
  display: flex; align-items: center; justify-content: center; gap: 10px;
  i { display: grid; place-items: center; width: clamp(48px, 17vw, 68px); height: 100px;
    border: 1px solid #f2ce7280; border-radius: 10px; font-style: normal; font-size: 26px;
    color: #f2ce72; background: linear-gradient(145deg, #285441, #10382c);
    box-shadow: 0 10px 22px #0003; animation: ${float} 2.8s ease-in-out infinite;
  }
  i:nth-child(2) { height: 115px; animation-delay: .3s; }
  i:nth-child(3) { animation-delay: .6s; }
`;
const Pulse = styled.div`
  display: flex; gap: 8px; margin: 18px 0;
  span { width: 6px; height: 6px; border-radius: 50%; background: #f2ce72; animation: ${glow} 1.5s ease-in-out infinite; }
  span:nth-child(2) { animation-delay: .2s; } span:nth-child(3) { animation-delay: .4s; }
`;
const OriginalQuestion = styled.details`
  border: 1px solid #f2ce7240; border-radius: 12px; padding: 12px 14px;
  summary { cursor: pointer; color: #f2ce72; }
  p { white-space: pre-wrap; color: #fff7dfb0; font-size: 14px; }
`;

const Main = styled.main`
  width: min(100%, 480px); min-height: 100dvh; margin: auto;
  padding: calc(18px + env(safe-area-inset-top)) clamp(12px, 5vw, 24px) calc(28px + env(safe-area-inset-bottom));
  color: #fff7df; background: radial-gradient(circle at 15% 10%, #d4af3720, transparent 35%), #08291f;
  h1 { margin: 28px 0 12px; font-size: clamp(26px, 7vw, 34px); line-height: 1.35; }
  h2 { font-size: 19px; margin: 0 0 10px; }
  p { line-height: 1.6; overflow-wrap: anywhere; }
  fieldset { border: 0; padding: 0; margin: 20px 0; min-width: 0; }
  legend { margin-bottom: 10px; font-weight: 700; }
  button, textarea, select { font: inherit; }
  button:focus-visible, textarea:focus-visible, select:focus-visible { outline: 2px solid #ffe49b; outline-offset: 3px; }
`;
const Back = styled.button`color: #f2ce72; min-height: 44px; cursor: pointer;`;
const Intro = styled.p`color: #fff7dfb0; margin-bottom: 24px;`;
const Label = styled.label`display: block; font-weight: 700; margin: 18px 0 10px;`;
const TextArea = styled.textarea`
  display: block; width: 100%; min-height: 170px; resize: vertical; padding: 14px;
  border: 1px solid #f2ce7270; border-radius: 14px; color: #fff7df; background: #ffffff09;
  font-size: 16px !important; line-height: 1.7; &::placeholder { color: #fff7df75; }
`;
const Help = styled.p`font-size: 12px; color: #fff7dfaa; span { display: block; text-align: right; }`;
const Button = styled.button`
  width: 100%; min-height: 50px; padding: 12px; border-radius: 13px; background: #f2ce72;
  color: #123a2b; font-weight: 800 !important; cursor: pointer; line-height: 1.5;
  &:disabled { opacity: .4; cursor: default; }
`;
const Panel = styled.section`margin-top: 24px; padding: clamp(12px, 4vw, 20px); border: 1px solid #f2ce7270; border-radius: 18px; background: #ffffff06;`;
const Grid = styled.div`display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px;`;
const Choice = styled.button<{ $selected: boolean }>`
  min-width: 0; min-height: 46px; padding: 9px 4px; border-radius: 10px; cursor: pointer;
  border: 1px solid ${({ $selected }) => $selected ? "#f2ce72" : "#ffffff30"};
  background: ${({ $selected }) => $selected ? "#f2ce7228" : "transparent"};
  color: #fff7df; font-size: 13px !important; word-break: keep-all;
`;
const Select = styled.select`
  width: 100%; min-width: 0; min-height: 48px; padding: 8px; border: 1px solid #f2ce7270;
  border-radius: 10px; background: #153b2e; color: #fff7df; font-size: 16px !important;
`;
