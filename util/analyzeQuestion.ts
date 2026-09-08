import type { TarotTopicId } from "../constants/tarotTopics.ts";

export const QUESTION_INTENTS = [
  { id: "contact", label: "연락·거리감" },
  { id: "feelings", label: "상대의 마음" },
  { id: "choice", label: "선택·결정" },
  { id: "possibility", label: "성사 가능성" },
  { id: "timing", label: "시기" },
  { id: "action", label: "다가가는 방법·조언" },
  { id: "flow", label: "앞으로의 흐름" },
] as const;
export type QuestionIntent = typeof QUESTION_INTENTS[number]["id"];
export type RelationshipGoal = "friendship" | "romance" | "unspecified";
export type QuestionAnalysis = {
  topic: TarotTopicId | null;
  intent: QuestionIntent | null;
  relationshipGoal: RelationshipGoal;
  evidence: string[];
  summary?: string;
  clarification?: string;
  selfMaritalStatus?: "married" | "unmarried" | "unknown";
  otherMaritalStatus?: "married" | "unmarried" | "unknown";
};

// This deliberately recognizes a bounded vocabulary. Unknown or tied topics
// remain unresolved so the visitor can choose instead of receiving a guess.
export function analyzeQuestion(question: string): QuestionAnalysis {
  const text = question.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
  const friendship = /친구로|친구처럼|친구가되고|친구사이|사심없|연애(?:는|가)?아니|좋아하는(?:게|건|것은|것이)아니/.test(text);
  const romanticText = text
    .replace(/(?:좋아하는(?:게|건|것은|것이)|연애(?:는|가)?)아니[^.!?]*/g, "")
    .replace(/남자친구|여자친구/g, "연인");
  const romance = !friendship && /연애|연인|썸|짝사랑|재회|헤어|이별|고백|사귀|좋아하는사람/.test(romanticText);
  const rules: Array<[TarotTopicId, RegExp, number]> = [
    ["career", /회사|직장|취업|취준|퇴사|이직|승진|면접|업무|커리어|진로|대학|학교|시험|합격|공부|학업/g, 3],
    ["money", /돈|금전|재정|월급|연봉|저축|대출|빚|투자|수입|지출|주식|부동산/g, 4],
    ["relationships", /친구|동료|가족|부모|엄마|아빠|인간관계|사람들과/g, 3],
    ["decision", /선택|결정|둘중|어느쪽|할까말까/g, 2],
    ["personal-flow", /내인생|내삶|나의흐름|전반적|무기력|자신감|나자신/g, 3],
  ];
  const scores = new Map<TarotTopicId, number>();
  const evidence: string[] = [];
  for (const [topic, pattern, weight] of rules) {
    const matches = [...new Set(text.match(pattern) ?? [])];
    if (matches.length) {
      scores.set(topic, matches.length * weight);
      evidence.push(...matches);
    }
  }
  if (friendship) {
    scores.set("relationships", (scores.get("relationships") ?? 0) + 12);
    evidence.push("친구로 지내고 싶은 관계");
  } else if (romance) {
    const topic = /새로운|새인연|언제만|만날수/.test(text) ? "new-love"
      : /마음|어떻게생각|나를좋아|날좋아/.test(text) ? "their-feelings" : "relationship-flow";
    scores.set(topic, 12);
    evidence.push("연애 관계에 대한 표현");
  }
  const ranked = [...scores].sort((a, b) => b[1] - a[1]);
  const topic = ranked.length && (!ranked[1] || ranked[0][1] - ranked[1][1] >= 2)
    ? ranked[0][0] : null;
  const intents: Array<[QuestionIntent, RegExp]> = [
    ["timing", /언제|몇월|얼마나걸|시기/],
    ["choice", /해도될|해도괜찮|그만|할까말까|선택|결정|옮겨도|연락해볼까/],
    ["contact", /연락|답장|읽씹|안읽씹|뜸해|뜸하|거리감|멀어/],
    ["feelings", /마음|어떻게생각|나를좋아|날좋아|속마음/],
    ["possibility", /할수있|될수있|가능|합격|성공|잘될까/],
    ["action", /어떻게해야|어떻게다가|방법|조언|친해지고|친해지소/],
    ["flow", /앞으로|어떻게될|흐름|전망/],
  ];
  return {
    topic,
    intent: intents.find(([, pattern]) => pattern.test(text))?.[0] ?? null,
    relationshipGoal: friendship ? "friendship" : romance ? "romance" : "unspecified",
    evidence: [...new Set(evidence)].slice(0, 5),
  };
}
