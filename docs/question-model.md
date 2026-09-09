# 질문과 카드로 한 번에 해설하기

현재 흐름: 질문 입력 → 카드 섞기·뽑기 → Gemini 해설.
주제·의도 선택이나 분석 확인 화면은 없습니다. 질문 입력/카드 선택 단계에는 AI 요청이 없습니다.
마지막에 서버가 질문 원문, 뽑은 카드 이름과 자리, 정방향 의미 기준을 묶어 Gemini에 한 번 보냅니다.
타로 한 번에 정상 생성 1회이며 실패 후 사용자가 재시도하면 추가 요청이 발생합니다.

## 서버와 데이터

- 모델: 기본 `gemini-3.6-flash`, 설정명 `GEMINI_READING_MODEL`.
- 키: 서버 전용 `GEMINI_API_KEY`. 로컬은 Git에서 제외된 `.env.local`, Vercel은 환경 변수.
- 카드 기본 정보는 Supabase `tarot_card_profiles`에서 선택한 카드만 조회합니다.
- 카드 의미는 `constants/cardReadingFoundations.ts`의 편집된 78장 기준을 사용합니다.
- 기존 상황별 DB 해설이나 분석 결과를 끼워 넣지 않습니다. DB 데이터는 변경하지 않습니다.
- 원 오라클, 쓰리카드(과거·현재·미래), 파이브카드의 자리 순서를 유지합니다.
- 출력은 결론 → 카드별 설명 → 실천 조언이며 좌우 이동은 버튼만 사용합니다.

## 개인정보와 한도

별도 동의 체크박스 없이 진행합니다. 동의 여부를 자동으로 참으로 기록하거나 전송하지 않습니다.
질문은 현재 탭에 보관하며 앱 DB나 서버 로그에는 저장하지 않습니다.
Google 무료 API의 입력/응답은 제품 개선이나 사람이 검토하는 대상이 될 수 있습니다. 입력 화면에는 개인정보·민감한 내용을 입력하지 말라는 짧은 안내를 표시합니다.
Gemini 요청은 90초 제한, 자동 재시도 없음. 429는 일일 또는 분당 한도 안내로 표시합니다.
무료/유료 등급은 Google 프로젝트가 결정합니다. 앱 코드가 유료 등급 과금을 차단하지는 않습니다.

## 이전 경로

`/question-analysis`는 질문 입력으로 이동합니다.
`/api/analyzeQuestion`은 410을 반환하며 AI를 호출하지 않습니다.
기존 Qwen/Gemini 분류 실험 유틸리티와 스크립트는 현재 서비스 흐름에서 사용하지 않습니다.
PC에서 Ollama를 실행하거나 터널을 연결할 필요가 없습니다.

## 필요한 경우의 확인

`npm run build`
`node --test --experimental-strip-types tests/tarotFlow.test.ts tests/geminiReading.test.ts tests/readingWriter.test.ts`
`node --experimental-strip-types scripts/check-personal-reading.mts`는 가상 질문의 실제 해설 요청 1회를 소비합니다.
