# 고급·기본 시트와 교환소 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 무료·유료 시트를 기본 시트로 합치고, 고급 시트 1장을 기본 시트 2장으로 교환한다.

**Architecture:** 기존 회원 지갑과 서버 인증을 재사용한다. DB 트랜잭션이 잔액 검증·차감·지급·교환 이력 기록을 원자적으로 처리한다. 클라이언트 잔액은 표시용이며 교환 권한 판단에 사용하지 않는다.

**Tech Stack:** Next.js, styled-components, Supabase PostgreSQL/RLS.

**Spec:** 이 대화에서 승인한 고급 시트(처음 상담), 기본 시트(연계질문), 광고 보상 통합, 단방향 1:2 교환 규칙.

## 범위와 제약

- 기존 paid + free 수량은 손실 없이 basic 잔액으로 이전한다. premium은 기존 대응 잔액이 없으므로 0으로 시작한다.
- 구매·광고로 얻은 기본 시트는 동일하게 사용하며 무료 시트 하루 1장 사용 제한을 제거한다.
- 광고는 하루 3회 완료 시 기본 시트 1장 지급 규칙을 유지한다.
- 한 상담당 연계질문 최대 2회, 슈퍼 계정 무료 이용과 '-장' 표시는 유지한다.
- 역교환 없음. 사용자 확인 후 매번 고급 1장 → 기본 2장 교환.
- 결제·광고 제공자 연동과 상담 유료 차단은 이번 범위에서 제외한다. 기존 준비 중 상태를 유지한다.
- 개인정보·상담 내용은 교환 요청이나 이력에 포함하지 않는다.
- 기존 배포와 마이그레이션 사이 호환성을 유지하고, DB 적용 전 교환을 성공한 것처럼 표시하지 않는다.
- 관련 테스트만 실행하고 병렬 에이전트를 사용하지 않는다.

## Review Focus

- 기존 잔액 이전이 반복 실행되어 두 배가 되지 않아야 한다.
- 고급 시트가 없을 때 교환 실패 후 모든 잔액이 동일해야 한다.
- 같은 요청 재전송은 한 번만 반영하며, 동시 요청으로 잔액이 음수가 되지 않아야 한다.
- 비회원·다른 계정 ID·브라우저 직접 잔액 쓰기로 교환할 수 없어야 한다.
- 교환 성공 후 응답 유실이나 캐시 때문에 재교환·잘못된 수량 표시가 발생하지 않아야 한다.

## 1. 지갑 및 원자적 교환

**Files:** 새 `supabase/migrations/202609290001_sheet_exchange.sql`, 새 `app/api/account/sheets/exchange/route.ts`, 관련 DB 회귀 검사.

**Interfaces:** 인증된 POST 요청은 `{requestId: UUID}`만 받는다. 사용자 ID는 서버 인증에서 얻는다. DB 교환 함수는 호출자의 지갑을 잠그고 고정된 1:2 비율을 적용하며 요청 ID를 사용자별 중복 방지 키로 기록한다. 지급·사용 이벤트는 기존 서버 전용 권한을 유지한다.

- [ ] 잔액 부족·중복·다른 사용자 요청 검사를 먼저 작성하고 실패를 확인한다.
- [ ] basic/premium 잔액, 기존 잔액 보존 이전, 광고 지급 및 기본 시트 사용 제한 제거를 구현한다.
- [ ] 로그인·동일 출처·UUID 검증을 적용하고 원자적 교환 RPC를 연결한다.
- [ ] 트랜잭션 롤백 방식으로 기존 잔액 합산·교환·중복·부족·권한을 검사한다. 운영 사용자의 실제 잔액으로 테스트하지 않는다.

## 2. 화면·캐시·안내 통합

**Files:** `types/mypageTypes.ts`, `app/api/account/dashboard/route.ts`, `util/accountDashboardCache.ts`, `util/mypageRules.ts`, `components/account/MyPage.tsx`, 새 `components/account/SheetExchange.tsx`, `components/home/SelectionAccountSummary.tsx`, `components/account/TartStamps.tsx`, `app/account/sheets/page.tsx`, 관련 가입·이용 안내.

**Interfaces:** 대시보드의 premium/basic을 화면에 표시한다. 교환 컴포넌트는 성공 후 캐시를 무효화하고 대시보드를 다시 가져온다. 네트워크 실패 시 같은 요청 ID로 재시도하며 새 교환은 새로운 확인과 ID를 사용한다.

- [ ] 잔액 표시와 광고 일일 사용 제한 제거에 대한 작은 회귀 검사를 작성한다.
- [ ] 무료/유료 구분 대신 고급/기본을 표시하고 기존 캐시 버전을 올린다.
- [ ] 보유 시트 아래에 교환소와 확인창, 처리 중 중복 클릭 차단, 잔액 부족·오류 안내를 추가한다.
- [ ] 구매·광고·회원 혜택 안내를 같은 용어로 정리한다.
- [ ] 관련 테스트와 타입 검사를 실행하고 280px 화면에서 확인한다. 실제 결제·광고·상담 생성은 테스트하지 않는다.

## 적용 순서

1. 코드와 마이그레이션 준비 및 최소 검증.
2. 연결된 Supabase에 접근 가능 여부를 확인하고, 필요한 권한 승인을 받은 뒤 DB 적용. 접근 불가 시 미적용 상태를 명시한다.
3. 로컬 화면 확인 후 완료 내역과 배포 여부를 구분해 보고한다.
