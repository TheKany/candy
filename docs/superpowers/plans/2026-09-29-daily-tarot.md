# Today's Tarot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. User requested sequential work: no subagents.

**Goal:** 질문 없이 78장 중 한 장을 뽑고 캐릭터 에너지 지수와 오늘의 해석을 보는 기능을 만든다.

**Architecture:** 별도 `/daily` 선택 화면과 `/daily/result` 결과 화면을 만든다. 기존 덱·키패드·뒤집기 컴포넌트와 서버 Gemini 호출기를 재사용하고, 결과는 별도 세션 저장소에 보관한다. 기존 상담 결과 화면, 결제 및 DB 저장 경로는 사용하지 않는다.

**Tech Stack:** 기존 Next.js App Router, React, styled-components, framer-motion, Zustand, Supabase/Gemini 서버 유틸리티. 새 의존성 없음.

**Spec:** `docs/superpowers/specs/2026-09-29-daily-tarot-design.md`

## Global Constraints

- 전체 78장, 정방향 1장. 질문 입력 없음.
- 약 1초 동안 두 카드 묶음이 서로 엇갈려 합쳐지는 셔플. 원형 회전 없음.
- 카드 왼쪽, 캐릭터·에너지 오른쪽. 절취선 아래 해석.
- 커스터드 몸만 아래부터 금색 채움. 나머지 몸은 연한 회색.
- 최소 너비 280px, 짧은 화면에서는 해석 영역 스크롤.
- 테스트 중 하루 제한·시트 차감·상담 DB 자동 저장 없음.
- 타입 검사와 관련된 소수의 검사만 수행. 무관한 리팩터링과 다중 작업 금지.
- 워터마크는 이미 배포됨. 이번 기능은 로컬 구현만 하며 추가 배포는 요청받은 뒤 진행.

## Review Focus

- 잘못된 카드 번호와 잘못된 지수는 서버에서 거절한다 (Task 1).
- 실패한 해석을 성공처럼 보여주지 않고 같은 카드로 재시도한다 (Task 3).
- 새로고침·React 재렌더가 완료된 결과를 중복 생성하지 않는다 (Task 3).
- 새로 뽑으면 이전 결과를 섞어 보여주지 않는다 (Task 2, 3).
- 280px/짧은 높이에서도 키패드와 해석이 접근 가능하다 (Task 2, 3).

### Task 1: 해석 계약과 서버 엔드포인트

**Files:** Create `util/dailyReadingWriter.ts`, `app/api/dailyReading/route.ts`, `tests/dailyReading.test.ts`.

**Interfaces:**
- `DailyReading = { energy: number; headline: string; interpretation: string; helpfulAction: string; cautionAction: string }`.
- `parseDailyRequest(value: unknown): { cardId: number } | null` — 내부 카드 ID 0~77 정수만 허용. 화면에서 고르는 덱 위치 1~78과 구분한다.
- `parseDailyReading(value: unknown): DailyReading` — 잘못된 데이터는 throw.
- `POST /api/dailyReading` body `{ cardId }`, 성공 `{ date, card, reading }`; `card`는 기존 `TarotCardProfile`, `date`는 서울 기준 YYYY-MM-DD. 실패 `{ code }`는 기존 오류 분류.

- [ ] 카드 번호 경계와 응답 검증 테스트 작성: ID 0/77 허용, -1/78/소수/문자열 거절; energy 0/100 허용, -1/101/NaN/소수 거절; 빈 해석 필드 거절.
- [ ] `node --test --experimental-strip-types tests/dailyReading.test.ts` 실행해 미구현 실패 확인.
- [ ] 명확한 한국어 행동 조언과 상징적 지수라는 시스템 프롬프트, JSON schema, 파서 구현. 문자열 필드는 비어 있지 않아야 한다.
- [ ] 기존 monthlyReading 라우트 패턴으로 구현: 요청 크기 2KB 제한, 카드 프로필과 CARD_READING_FOUNDATIONS 조회, 서울 날짜를 서버에서 결정, `generateGeminiJSON` 1회 호출 (최대 출력 4096토큰), no-store 응답. API 키는 서버에만 둔다. 오류·불완전 응답은 기존 코드로 반환.
- [ ] 해당 테스트만 재실행해 PASS 확인 후 이 작업 파일만 커밋.

### Task 2: 메뉴와 빠른 카드 선택

**Files:** Modify `components/home/ReadingSelect.tsx`, `constants/tarotTypes.ts`, `util/cardSelectionFlow.ts`; create `app/daily/page.tsx`, `components/daily/DailyShuffle.tsx`, `store/useDailyReadingStore.ts`; extend `tests/dailyReading.test.ts`.

**Interfaces:**
- `TarotTypeId`에 `daily` 추가. 기존 상담 TAROT_TYPES 목록에는 넣지 않는다.
- `getRequiredCardCount('daily') === 1`; `shouldOpenResultAfterReveal('daily', 1, true) === true`.
- `useDailyReadingStore`: `{ drawId, cardId, result, begin(): void, select(cardId: number): void, complete(drawId: string, result: DailyReadingResult): void }`.
- `DailyReadingResult = { date: string; card: TarotCardProfile; reading: DailyReading }`는 `util/dailyReadingWriter.ts`에서 타입으로 제공. Zustand sessionStorage persist로 탭 내 새로고침 복원. 이전 drawId 응답은 무시.

- [ ] daily 1장 선택·뒤집기 완료 조건 테스트 추가, 미지원 실패 확인.
- [ ] daily 타입과 위 상태 계약 구현. 새 메뉴 시작 시에만 선택 관련 상태를 기존 시작 동작처럼 초기화한다. 기존 상담 history UI와 DB 경로에는 연결하지 않는다.
- [ ] ‘가볍게 한 입’ 준비 중 영역을 오늘의 타로 메뉴로 변경. 클릭 시 begin 후 `/daily` 이동. 워터마크 보존.
- [ ] DailyShuffle에 두 묶음의 엇갈림→정렬 모션을 1초로 구현. 0~77 배열을 Fisher–Yates로 한 번 섞으며 기존 getRandomCardNo의 불필요한 지연 타이머는 가져오지 않는다. reduced-motion이면 즉시 정렬. 완료 후 기존 TarotCardBoard, PickCardBoard, NumberPad 재사용. 셔플 중 입력 잠금, 카드 선택·뒤집기 완료 후 cardId 저장하고 `/daily/result`로 이동. 효과 타이머는 언마운트 시 정리.
- [ ] 안내 문구는 ‘오늘의 흐름을 담고 있어요’와 ‘오늘의 카드 한 장을 골라주세요’. 질문을 생각하라는 기존 문구는 사용하지 않는다.
- [ ] 테스트 및 `npm run typecheck` 확인. 280px/짧은 화면에서 카드와 숫자키패드 접근성을 브라우저로 확인하고 작업 파일만 커밋.

### Task 3: 캐릭터 지수와 결과

**Files:** Create `app/daily/result/page.tsx`, `components/daily/DailyReadingResult.tsx`, `components/daily/TartEnergy.tsx`, `util/dailyReadingClient.ts`, `public/images/mascot/tart-oracle-energy-v1.png`, `public/images/mascot/tart-oracle-body-mask-v1.svg`; modify `components/result/TartOvenStatus.tsx`, `design/brand/tart-oracle/README.md`.

**Interfaces:**
- `TartEnergy({ value }: { value: number })` — 에너지 수치를 텍스트와 그림으로 제공.
- `fetchDailyReading(drawId: string, cardId: number): Promise<DailyReadingResult>` — 동일 진행 요청을 모듈 내 Promise로 합치고 실패 시 제거. 완료된 값은 Task 2 세션 상태 사용.
- TartOvenStatus `variant`에 `daily` 추가. 질문 변경 링크 없이 오늘의 흐름을 굽는 문구, 기존 실패별 화면 사용.

- [ ] 승인된 컨셉 시트를 이미지 생성 스킬로 단일 캐릭터 자산으로 파생. 원본 보존. 같은 좌표계의 커스터드 몸 SVG 마스크를 마련하고 0/50/100%에서 몸 외부가 채워지지 않는지 확인.
- [ ] 결과 컴포넌트를 승인 레이아웃대로 구현. 2열 상단 아래 절취선과 핵심 메시지/해석/도움 행동/주의 행동. 지수 보조 문구는 ‘카드의 상징으로 읽는 오늘의 흐름이에요’.
- [ ] fetchDailyReading 구현: 응답 검증과 기존 오류 분류, 카드 ID 불일치 거절. 네트워크·한도 실패 시 오류 화면. 재시도는 같은 카드, 새로 뽑기는 begin 후 `/daily` 이동.
- [ ] 세션 복원 전 요청하지 않는다. 선택 카드가 없으면 `/select`로 이동. 완료 결과가 있으면 재요청하지 않는다. 과거 drawId의 늦은 응답이 새 결과를 덮지 않게 한다.
- [ ] 요청 함수를 제어한 관련 검사로 중복 호출 1회, 실패 후 재시도 가능, 늦은 응답 무시를 확인. 타로 서버 실제 요청은 흐름 확인에 필요한 1회로 제한.
- [ ] `npm run typecheck`와 daily 테스트만 실행. 브라우저로 전체 흐름·완료 후 새로고침·0/100 채움·280px 표시를 확인. 작업 파일만 커밋하고 로컬 확인 경로를 안내한다.
