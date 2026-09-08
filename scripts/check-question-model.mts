import { DEFAULT_QUESTION_MODEL, QUESTION_SCHEMA, QUESTION_SYSTEM_PROMPT, parseQuestionModelOutput } from "../util/questionModel.ts";

// Explicitly run against a local model only; no paid API and no database writes.
const cases = [
  { question: "저는 결혼한 남자예요. 좋아하는 건 아니고 진짜 친구로 친해지고 싶은 여자분이 있는데 연락이 잘 되다가 뜸해졌어요. 왜 그런지 궁금해요.", topic: "relationships", goal: "friendship", self: "married", other: "unknown" },
  { question: "내가 아니라 상대가 결혼했어요. 그 사람과 친구로 지내고 싶어요. 어떻게 다가가면 좋을까요?", topic: "relationships", goal: "friendship", self: "unknown", other: "married" },
  { question: "회사에 좋아하는 사람이 있어요. 친구로만 지내고 싶은 건 아니에요. 연애하고 싶은데 그 사람이 저를 어떻게 생각하는지 궁금해요.", topic: "their-feelings", goal: "romance", self: "unknown", other: "unknown" },
];
for (const sample of cases) {
  const start = Date.now();
  const reply = await fetch("http://127.0.0.1:11434/api/chat", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: DEFAULT_QUESTION_MODEL,
      messages: [{ role: "system", content: QUESTION_SYSTEM_PROMPT }, { role: "user", content: sample.question }],
      stream: false, think: false, format: QUESTION_SCHEMA, options: { temperature: 0, presence_penalty: 0, num_ctx: 4096, num_predict: 700 },
    }), signal: AbortSignal.timeout(110000),
  });
  if (!reply.ok) throw new Error(`Model HTTP ${reply.status}`);
  const result = await reply.json();
  const analysis = parseQuestionModelOutput(JSON.parse(result.message.content), sample.question);
  console.log(JSON.stringify({ seconds: (Date.now() - start) / 1000, ...analysis }));
  if (analysis.topic !== sample.topic || analysis.relationshipGoal !== sample.goal
    || analysis.selfMaritalStatus !== sample.self || analysis.otherMaritalStatus !== sample.other) {
    throw new Error("Question meaning did not match the expected interpretation");
  }
}
