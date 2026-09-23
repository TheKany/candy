# Monthly Tarot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task in this session. Steps use checkbox syntax for tracking. 사용자 요청에 따라 병렬 구현과 과한 테스트는 하지 않는다.

**Goal:** 질문 입력 없이 이번 달부터 12월까지 카드를 뽑고 월별 해설과 클로버 지수를 본다.

**Architecture:** 기존 shuffle 화면에 monthly 유형을 연결한다. 날짜와 결과는 월별 전용 메모리 store, 해설은 전용 API/프롬프트, 화면은 전용 결과 컴포넌트로 분리한다. Gemini 호출·오류 화면·덱 선택은 재사용한다.

**Tech Stack:** Next.js App Router, React, TypeScript, styled-components, Zustand, 기존 Supabase/Gemini 연결. 새 의존성 없음.

**Spec:** `docs/superpowers/specs/2026-09-23-monthly-tarot-design.md`

## Global Constraints

- 한국 시간 기준 이번 달부터 같은 해 12월까지, 최대 12장이다. 9월에는 9~12월 4장을 뽑는다.
- 시작한 연도와 월은 세션 동안 고정한다.
- 한 덱에서 중복 없이 정방향으로 뽑는다.
- 기존 한 장·세 장·다섯 장 상담은 그대로 유지한다.
- 새 DB 테이블, 로그인, 결제, 서버 상담 기록 저장은 추가하지 않는다.
- 브라우저 흐름 검사는 가짜 해설로 수행해 API 사용량을 소모하지 않는다.

## Review Focus

- 한국 월 경계: UTC 날짜가 이전 달이어도 한국 시간의 이번 달로 시작한다. Task 1의 날짜 검사에 포함한다.
- 새로고침과 직접 접속: 메모리 세션 없이 결과/셔플에 들어와도 끝없는 로딩이 아닌 선택 화면으로 안내한다. Task 3 브라우저 검사에 포함한다.
- 직전 연계 상담: 월별 시작 시 이전 질문·덱·선택·해설을 재사용하지 않는다. Task 1 시작 동작과 Task 3 흐름 검사에 포함한다.
- 12장 선택: 화면 아래쪽 자리의 좌표와 스크롤을 고려해 뒤집기 완료 후 한 번만 결과로 이동한다. Task 3의 최대 장수 검사에 포함한다.
- 잘못된 해설: 월/카드 순서 불일치나 100 초과 지수를 정상 화면으로 표시하지 않는다. Task 2 응답 검사에 포함한다.

## Task 1: 날짜 세션과 카드 선택 연결

**Files**

- Create: `types/monthlyReadingTypes.ts`, `util/monthlyReading.ts`, `store/useMonthlyReadingStore.ts`, `tests/monthlyReading.test.ts`
- Modify: `constants/tarotTypes.ts`, `components/home/ReadingSelect.tsx`, `util/tarotFlow.ts`, `util/handleResetStore.ts`, `util/cardSelectionFlow.ts`, `app/shuffle/page.tsx`, `components/shuffle/NumberPad.tsx`, `components/shuffle/PickCardBoard.tsx`, `components/shuffle/InfoText.tsx`

**Interfaces**

```ts
type MonthlyPeriod = { year: number; startMonth: number; months: number[] };
type MonthlyPage = {
  month: number; cardId: number; nickname: string; message: string;
  money: string; work: string; relationships: string; wellbeing: string;
  luck: number; luckMessage: string;
};
type MonthlyReadingResult = { year: number; pages: MonthlyPage[]; cards: TarotCardProfile[] };
// types/monthlyReadingTypes.ts imports TarotCardProfile as a type.
getMonthlyPeriod(now?: Date): MonthlyPeriod;
// store: period: MonthlyPeriod|null, result: MonthlyReadingResult|null,
// start(): void, saveResult(result: MonthlyReadingResult): void, reset(): void
```

- [ ] 날짜 검사부터 추가하고 실패를 확인한다.

```ts
assert.deepEqual(getMonthlyPeriod(new Date('2026-08-31T15:00:00Z')), {
  year: 2026, startMonth: 9, months: [9, 10, 11, 12],
});
assert.equal(getMonthlyPeriod(new Date('2026-01-01T00:00:00Z')).months.length, 12);
assert.deepEqual(getMonthlyPeriod(new Date('2026-12-01T00:00:00Z')).months, [12]);
```

Run: `node --test --experimental-strip-types tests/monthlyReading.test.ts`
Expected before implementation: missing monthly utility. Expected after implementation: assertions pass.

- [ ] `Intl.DateTimeFormat`의 `timeZone: 'Asia/Seoul'`과 `formatToParts`로 연도·월을 구하고 다음 계산으로 월 목록을 만든다.

```ts
const months = Array.from({ length: 13 - startMonth }, (_, index) => startMonth + index);
```

- [ ] `monthly`를 TarotTypeId/AvailableTarotTypeId와 TAROT_TYPES에 추가한다. 선택 action의 href에 `/shuffle`을 허용한다. 월별 시작 시 기존 reset을 호출한 뒤 월별 store.start(), setType('monthly'), router.push('/shuffle') 순서로 실행한다. 일반 리딩 시작 시 남은 monthly 세션은 비운다.
- [ ] `getReadingFlowRedirect`는 monthly를 질문 검사에서 제외한다. ShufflePage는 별도로 period 유무를 확인해 없으면 `/select`로 보낸다. store.start()는 월별 선택 버튼에서만 호출해 화면 재렌더 중 날짜를 다시 계산하지 않는다.
- [ ] 아래 선택 함수에 선택적 `monthlyCount`/`monthlyMonths` 인자를 추가한다. 기존 호출 기본값은 기존 동작을 유지한다.

```ts
getRequiredCardCount(type, monthlyCount = 0);
shouldOpenResultAfterReveal(type, pickedCount, revealComplete, monthlyCount = 0);
getNextPositionLabel(type, spread, pickedCount, monthlyMonths = []);
// monthly: count = period.months.length; label = `${monthlyMonths[pickedCount]}월`.
```

- [ ] NumberPad의 개수 상한을 `getRequiredCardCount`로 통일한다. 훑기/결정 및 중복 방지는 기존 로직을 사용한다. Monthly일 때 PickCardBoard는 2~3열 반응형 월별 자리를 만든다. 각 자리 좌표는 기존 slot store에 기록한다. 그 외 자리 배치는 바꾸지 않는다.
- [ ] monthly의 셔플 안내는 `카드를 섞는 동안 앞으로의 나날을 떠올려보세요.`로 표시한다. 마지막 카드 뒤집기 이후 기존 결과 경로로 이동한다.
- [ ] 월별 개수에 대한 선택 완료 검사와 기존 cardSelectionFlow/tarotFlow 관련 검사만 실행하고 변경 파일을 커밋한다.

## Task 2: 월별 해설 API

**Files**

- Create: `util/monthlyReadingWriter.ts`, `app/api/monthlyReading/route.ts`, `tests/monthlyReadingWriter.test.ts`
- Modify: `util/readingTransport.ts`

**Interfaces**

```ts
// POST /api/monthlyReading
type MonthlyRequest = { year: number; startMonth: number; cardIds: number[] };
monthlyReadingSchema(count: number): object;
parseMonthlyReading(value: unknown, period: MonthlyPeriod, cardIds: number[]): MonthlyPage[];
requestMonthlyReading(payload: MonthlyRequest, signal: AbortSignal, onRetry?: () => void): Promise<MonthlyReadingResult>;
```

- [ ] 1월 12건/12월 1건 정상 응답, 월 불일치, 카드 불일치, 빈 해설, 범위 밖 luck를 검증한다. 기존 node:test/assert 형식을 사용한다.

```ts
const page = { month: 12, cardId: 0, nickname: '새로운 발걸음', message: '익숙한 일상에서 작은 변화를 시도해보세요.',
 money: '새 지출을 늘리기 전에 이번 달의 생활비를 먼저 확인해보세요.',
 work: '처음부터 완벽하려 하기보다 작은 일을 직접 해보며 배워보세요.',
 relationships: '가벼운 안부로 대화를 시작하고 상대의 속도도 살펴보세요.',
 wellbeing: '새로운 활동을 하되 충분히 쉴 시간을 함께 마련해보세요.', luck: 65,
 luckMessage: '작은 시도가 새로운 경험으로 이어질 수 있어요.' };
const period = { year: 2026, startMonth: 12, months: [12] };
assert.equal(parseMonthlyReading({ pages: [page] }, period, [0])[0].month, 12);
assert.throws(() => parseMonthlyReading({ pages: [{ ...page, luck: 101 }] }, period, [0]));
assert.throws(() => parseMonthlyReading({ pages: [{ ...page, month: 11 }] }, period, [0]));
assert.throws(() => parseMonthlyReading({ pages: [{ ...page, cardId: 1 }] }, period, [0]));
```

- [ ] 스키마와 파서를 구현한다. pages 개수는 13-startMonth, month/cardId는 입력과 정확히 일치해야 한다. 문자열은 trim 후 비어 있지 않고 길이 상한을 적용하며, luck는 0~100 정수다. 실패는 기존 `GeminiReadingError`의 `incomplete`로 변환한다.
- [ ] API는 JSON 본문 16KB 이하, year 정수 2000~2100, startMonth 정수 1~12, cardIds 개수/중복/정수 0~77을 검증한다. 입력의 카드명이나 지시를 신뢰하지 않는다. DB 프로필과 CARD_READING_FOUNDATIONS를 월 순서에 맞춰 Gemini에 전달한다. 카드 누락/설정 불비는 configuration, Gemini 오류는 기존 code를 반환한다. 응답은 Cache-Control:no-store다.
- [ ] 월별 프롬프트는 질문 없는 범용 해설, 월별로 다른 해석, 4개 분야별 2~3문장, 행동 중심의 따뜻한 한국어를 요구한다. 카드명을 키워드에 기계적으로 대입하지 않는다. 임의 사건과 확정 예언을 금지한다. luck는 사실적 확률이 아닌 해설용 지수임을 명시한다.
- [ ] 기존 `generateGeminiJSON(prompt, input, schema, signal, 16384)`를 한 번 호출한다. maxDuration은 기존과 같은 120초다. 결과 검증 후 `{ year, pages, cards }`를 반환한다.
- [ ] readingTransport의 기존 함수를 내부 `requestReading(endpoint, payload, signal, onRetry)`로 추출한다. endpoint는 두 경로 리터럴만 허용하고 개인 리딩 wrapper는 기존 호출 서명을 유지한다. 월별 wrapper를 추가한다. 오류 코드/timeout/abort/일시 장애 1회 재시도 규칙은 변경하지 않는다.
- [ ] 월별 파서와 기존 readingTransport 검사만 실행하고 커밋한다. 실 Gemini 호출은 하지 않는다.

## Task 3: 월별 결과 화면과 검증

**Files**

- Create: `components/result/MonthlyReadingResult.tsx`, `components/result/MonthlyReadingResult.styles.ts`, `components/result/LuckClover.tsx`
- Modify: `app/result/page.tsx`
- Browser check: `.tarot-import/monthly-ui-check.cjs` (기존 로컬 검사 방식, 커밋 제외)

**Interfaces**

```tsx
<MonthlyReadingResult onHome={onClickHome} />
<LuckClover value={page.luck} />
// result route: type === 'monthly' is handled before the one-card fallback.
```

- [ ] 결과 컴포넌트는 period/선택한 카드가 없으면 `/select`로 안내한다. 이미 메모리에 검증된 결과가 있으면 요청하지 않는다. 없으면 requestMonthlyReading을 호출하고 store.saveResult로 저장한다. useEffect 정리에서 요청을 취소한다. 에러는 TartOvenStatus로 보여주며 재시도 시 카드와 period를 그대로 쓴다.
- [ ] 전체 목록을 button 카드로 만든다. 월, `/cards/card${cardId}.webp`, DB 카드명, nickname을 표시한다. 월 선택 상태는 `number|null`이며 null은 전체 보기다.
- [ ] 상세는 message, 4개 분야, 클로버 순서다. 월 전환 시 본문 scrollTop을 0으로 되돌린다. Footer는 bottom:0, max-width:480px, safe-area padding을 사용하고 본문은 footer 높이 이상 padding-bottom을 확보한다.
- [ ] 클로버는 SVG 단일 실루엣에 회색 base와 같은 초록 shape를 겹친다. React.useId로 clipPath id를 고유하게 만들고 아래에서 채운다.

```tsx
<clipPath id={clipId}><rect x="0" y={100 - value} width="100" height={value} /></clipPath>
// value=0: 초록 없음, value=100: 전체 초록. 숫자와 '행운 지수' 텍스트를 함께 제공.
```

- [ ] 280px 브라우저에서 해설 API를 mock한다. 질문 없이 진입, 월별 선택과 뒤집기, 결과 요청 1회, 월 카드 열기/이전/다음/전체보기 시 호출 증가 없음, 12월1장과1월12장, 홈 이동, 세션 없는 새로고침 복귀를 확인한다. 기존 연계 상담 흐름은 한 번의 관련 회귀 검사로 유지한다.
- [ ] `npm run build`가 성공하는지 확인한다. 기존 metadataBase 경고 등 무관한 정리는 하지 않는다. 변경 범위를 자체 검토한 뒤 기능 커밋으로 마무리한다. 배포 요청 시에만 기존 Vercel 배포 흐름으로 진행한다.

## 실행 방식

이 세션에서 순차 구현한다. 새 라이브러리, DB 적재, 대규모 테스트, 병렬 에이전트 작업은 추가하지 않는다. 문서 승인 이후 세 작업을 중간 승인 없이 이어서 수행한다.
