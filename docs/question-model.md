# 한국어 질문 분석과 Gemini 해설

질문 입력 → Next.js `/api/analyzeQuestion` → 직접 운영하는 Ollama/Qwen → 사용자 확인 → 카드 선택.
질문을 풀어쓴 한국어 요약, 주제, 의도, 원하는 관계, 질문자/상대의 결혼 여부를 구분합니다.
질문 분석 단계에서는 해석이나 예측을 생성하지 않습니다. 분류 결과는 현재 탭에 보관하며 원문을 DB나 로그에 기록하지 않습니다.
카드 선택 후 Google 전송 안내를 확인해야 해설을 시작합니다. `/api/personalReading`이 원문, 확인한 분석, 카드별 핵심 의미를 Gemini에 한 번 전달합니다.
서버의 `GEMINI_API_KEY`가 있으면 Gemini를 사용합니다. 키가 없는 환경에만 기존 Ollama 해설 경로가 남아 있으며 Gemini 오류 시 다른 모델로 자동 재시도하지 않습니다.
무료 Gemini 입력/출력은 Google 제품 개선 및 사람 검토 대상이 될 수 있으므로 현재 화면은 개인정보 없는 가상 질문 체험용으로 안내합니다.
카드와 자리 정보는 DB 조회 결과를 유지합니다. 기존 DB의 상황별 문장에는 질문에 없는 사건을 단정하는 내용이 있어 생성 입력에서 제외합니다.
정방향 78장의 의미 기준은 `constants/cardReadingFoundations.ts`에서 별도로 편집했습니다. 기존 DB를 덮어쓰지 않습니다.
원 오라클/쓰리카드/파이브카드 모두 질문에 맞춘 결론, 카드별 설명, 마지막 실행 조언을 작성합니다.
실패했을 때 기존 짧은 문장을 맞춤 해설처럼 대신 보여주지 않으며 같은 카드로 재시도할 수 있습니다.
Gemini 호출은 최대 90초 기다립니다. 2026-09-09 가상의 커리어 질문/쓰리카드 한 건은 전체 API 응답까지 9.45초 걸렸습니다. 모든 질문·카드 조합의 품질이나 동일한 속도를 보장하는 측정은 아닙니다.
429 한도 오류는 사용자에게 안내하며 자동 재시도하지 않습니다. 분당 한도와 일일 한도가 다르므로 모든 429를 '오늘 소진'으로 단정하지 않습니다.
Google 프로젝트의 무료 등급 상태가 비용을 결정하며 이 코드가 유료 프로젝트의 과금을 차단하지는 않습니다. 결제 연결/유료 전환은 하지 않았습니다.

## 로컬 실행

이 PC의 Ollama 실행 파일: `C:\Dev\tools\tarot-ollama\runtime\ollama.exe`
질문 분석 모델: `qwen3.5:4b` (약 3.4GB).
해설 작성 모델: `gemini-3.6-flash` (Google API). 2.5 Flash는 이 신규 프로젝트에서 404를 반환하며 3.6 Flash 사용을 안내했습니다.

```powershell
& 'C:\Dev\tools\tarot-ollama\runtime\ollama.exe' serve
# 다른 터미널에서
npm run dev
```

Ollama가 이미 실행 중이면 다시 시작할 필요가 없습니다. 시스템 자동 시작은 설정하지 않았습니다.
로컬에서는 `http://127.0.0.1:11434`에 연결합니다. 질문을 편집하면 진행 중인 분석을 취소합니다.
응답 실패나 잘못된 출력은 직접 선택 화면으로 보완합니다. 규칙 분석을 LLM 분석처럼 표시하지 않습니다.

## 배포 연결

Vercel 안에는 모델이 포함되지 않습니다. Vercel의 localhost는 이 PC가 아닙니다.
질문 자동 분석을 유지하려면 별도로 계속 실행되는 Ollama 서버와 HTTPS 인증 프록시가 필요합니다. Gemini 해설 자체는 Ollama가 필요하지 않습니다.
운영자가 관리하는 주소만 설정하고 인증 없는 Ollama 포트를 인터넷에 공개하지 마세요.

- `QUESTION_MODEL_URL`: 인증 프록시의 HTTPS 기본 주소 (`/api/chat`은 앱에서 추가)
- `QUESTION_MODEL_TOKEN`: 프록시가 검증하는 Bearer 토큰 (서버 전용)
- `QUESTION_MODEL_NAME`: 생략하면 위 Qwen 모델 사용
- `READING_MODEL_NAME`: 해설 작성 모델을 별도로 지정할 때 사용. 기본은 `qwen3.5:9b`
- `GEMINI_API_KEY`: 서버 전용 Gemini 키. 로컬은 Git에서 제외된 `.env.local`, Vercel은 배포 환경 변수에 별도 등록. 클라이언트용 접두사를 붙이지 않습니다.
- `GEMINI_READING_MODEL`: 기본 `gemini-3.6-flash`. 임의 변경 시 무료 지원 여부와 thinkingLevel 지원을 먼저 확인합니다.

프록시에는 접근 인증 및 요청량 제한을 적용해야 합니다. Ollama 자체는 이 Bearer 인증을 검증하지 않습니다.
Gemini API의 무료 등급을 사용합니다. 프로젝트의 실제 일일 한도는 AI Studio에서 확인하며 한도 소진 테스트는 하지 않습니다.
연결 주소가 없는 Vercel 배포에서는 자동 분석을 사용할 수 없다고 알리고 직접 선택을 제공합니다.

필요할 때만 3개 한국어 예시 확인:
`node --experimental-strip-types scripts/check-question-model.mts`

Gemini 해설은 `node --experimental-strip-types scripts/check-personal-reading.mts`로 가상 질문 한 건을 확인할 수 있습니다. 실행할 때마다 실제 요청이 소비됩니다.
