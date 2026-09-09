// Manually run a single controlled example; never reads visitors' questions or writes the DB.
const context = {
  mode: "three", cardIds: [23, 11, 38],
  question: "가상의 연습 질문입니다. 새로운 업무를 배우는 직장인인데 앞으로 회사생활에서 어떻게 적응하고 성장하면 좋을까요?",
};
const started = Date.now();
const response = await fetch("http://localhost:3000/api/personalReading", {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify(context), signal: AbortSignal.timeout(290000),
});
const result = await response.json();
console.log(JSON.stringify({ seconds: (Date.now() - started) / 1000, status: response.status }));
if (!response.ok) throw new Error(result.error);
console.log(JSON.stringify({ conclusion: result.conclusion, advice: result.advice,
  pages: result.pages.map(({ positionLabel, headline, summary, detail, reflectionQuestion }: Record<string, string>) =>
    ({ positionLabel, headline, summary, detail, reflectionQuestion })),
}, null, 2));
