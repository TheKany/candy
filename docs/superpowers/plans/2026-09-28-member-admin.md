# Member Administration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. No parallel agents, per user preference.

**Goal:** 개인정보 없이 회원 등급을 관리하고 슈퍼 안내 확인을 DB에 유지한다.
**Architecture:** 기존 Supabase 사용자 인증과 본인 전용 RLS를 유지한다. 별도 관리자 명단을 검증하는 제한된 RPC로 목록/등급 변경만 허용한다. 기존 슈퍼 확인 RPC는 등급 버전 검증을 추가한다.
**Tech Stack:** Next.js App Router, TypeScript, styled-components, Supabase PostgreSQL.
**Spec:** `docs/superpowers/specs/2026-09-28-member-admin-design.md`

## Global Constraints

- 일반/슈퍼와 관리자 권한은 별개다.
- 관리자 목록은 회원번호, 가입일, 등급, 상태, 상세만 제공한다.
- 상세는 결제 이력만 제공하며 현재 결제 연동 전이므로 빈 상태를 명시한다.
- 개인 질문, 카드, 해설, 닉네임, 이메일은 관리자 조회에서 제외한다.
- 미사용: 상담 완료 기록 없음. 사용중: 마지막 완료 후 90일 미만. 휴면: 90일 이상. 표시만 변경한다.
- 기존 미배포 변경과 사용자 데이터를 보존한다. 관련 검증만 수행하고 새 테스트 도구를 설치하지 않는다.
- 실제 관리자 UUID 지정과 운영 DB 권한 적용은 대상 확인 후 진행한다. 배포는 이번 범위가 아니다.

## Review Focus

- 슈퍼 이용자가 관리자 URL 또는 RPC를 직접 호출해도 거부: Task 1 SQL 검사.
- 동일 등급 재저장으로 안내가 불필요하게 초기화되지 않음: Task 1 SQL 검사.
- 이전 승격의 확인 요청이 새 승격 안내를 숨기지 않음: Task 1 SQL 검사 및 Task 3 API 연결 확인.
- 검색 결과 없음과 결제 없음이 오류와 구분됨: Task 2 화면 확인.
- 관리자 변경 후 이미 로그인한 이용자가 마이페이지에 진입해도 새 등급 안내 확인 가능: Task 3 화면 확인.

## Task 1 — DB 권한과 회원번호

**Files:** `supabase/migrations/202609280001_member_admin.sql`, `supabase/tests/member_admin.sql`

**Interfaces:**
- `member_accounts.member_number text unique not null`: `TR-` + 임의 UUID의 하이픈을 제거한 32자리. 생성 충돌은 재시도하며 기존 회원도 채운다.
- `member_accounts.role_version integer not null default 0`: 실제 등급 변경 시 증가.
- `member_admins(user_id uuid primary key)` 및 `member_role_changes`: 브라우저 직접 쓰기 금지, RLS 활성화.
- `is_member_admin() returns boolean`: 요청자의 관리자 여부만 반환.
- `admin_list_members(p_search text, p_offset integer) returns jsonb`: 고정 20건, `{items,hasMore}`. 각 항목은 `{memberNumber,createdAt,role,status}`. 상태는 member_activity의 마지막 완료 시각으로 계산.
- `admin_set_member_role(p_member_number text,p_role text) returns void`: 관리자 검증, 대상 행 잠금, 값 검증, 변경 기록. 실제 역할 변경에 한해 버전 증가 및 확인 시각 초기화.
- `admin_member_detail(p_member_number text) returns jsonb`: 관리자 검증 후 `{memberNumber,payments:[],paymentsConnected:false}`. 결제 데이터가 아직 없는 사실을 명시한다.
- `acknowledge_super_notice(p_role_version integer) returns void`: 본인 슈퍼 등급과 현재 버전이 일치할 때만 저장. 기존 무인자 RPC는 제거한다.

- [ ] 롤백형 SQL 검증을 먼저 작성한다: 비관리자/슈퍼 거부, 난수 중복 방지, 90일 경계, 실제 변경/동일 변경, 오래된 버전 확인 거부.
- [ ] 사용 가능한 격리 DB에서 검증 실패를 확인한다. DB가 없으면 운영 DB에 무단 실행하지 않고 실행 대기로 기록한다.
- [ ] 마이그레이션 구현. 변경 기록과 등급 업데이트는 한 트랜잭션, 고정 search_path 및 최소 EXECUTE 권한 적용.
- [ ] 동일 SQL 검증을 실행해 롤백과 결과 확인. 운영 적용은 관리자 대상 확인 후 수행.

## Task 2 — 관리자 API와 화면

**Files:** `lib/auth/admin.ts`, `types/adminTypes.ts`, `app/api/admin/members/route.ts`, `app/api/admin/members/[memberNumber]/route.ts`, `app/admin/members/page.tsx`, `app/admin/members/[memberNumber]/page.tsx`, `components/account/MemberAdmin.tsx`, `components/account/MemberPaymentHistory.tsx`, `components/account/MyPage.tsx`, `lib/auth/member.ts`

**Interfaces:**
- `requireAdmin()`: requireAccount 후 DB 관리자 여부 확인, 거부는 403. 모든 관리자 API에서 호출.
- Account에 `isAdmin:boolean`, `roleVersion:number` 추가. 관리자 존재 여부 조회 실패는 관리자 접근 불허로 처리.
- GET `/api/admin/members?search=&offset=`: 제한된 목록 RPC 결과만 반환.
- GET `/api/admin/members/[memberNumber]`: 결제 상세 RPC 결과 반환.
- PATCH 동일 경로 `{role:"member"|"super"}`: 동일 출처/JSON 값 검증 후 등급 RPC 호출.

- [ ] 기존 node:test 방식으로 입력 검증을 먼저 추가하고 허용되지 않은 등급·offset을 거부하는 실패를 확인한다. 관련 유틸은 `util/adminInput.ts`, 검증은 `tests/adminInput.test.ts`에 둔다.
- [ ] 서버 API 및 타입 구현. 응답은 private/no-store, 예상하지 못한 DB 오류 원문을 노출하지 않는다.
- [ ] 회원번호 검색/20건 페이지 목록, 등급 변경 확인/저장 중 중복 방지/오류 표시, 결제 상세 빈 상태를 구현한다. 280px에서 긴 난수 번호는 줄바꿈한다.
- [ ] 마이페이지에 isAdmin일 때만 관리자 링크 추가. 링크 표시와 무관하게 API는 서버 검증한다.
- [ ] 해당 node 테스트와 `npm run typecheck` 실행. DB 적용 후 비관리자 차단과 실제 관리자 빈 결제 화면만 확인한다.

## Task 3 — 마이페이지 슈퍼 안내

**Files:** `components/auth/SuperWelcome.tsx`, `components/account/MyPage.tsx`, `app/api/account/super-notice/route.ts`, 필요 시 `components/auth/AuthProvider.tsx`

**Interfaces:** POST `/api/account/super-notice` body `{roleVersion:number}`. 성공 시 계정 새로 조회, DB 확인 시각이 반영된 뒤 닫는다.

- [ ] Task 1의 버전 확인 검증 및 현재 전역 팝업 동작을 기준으로 변경 지점을 확인한다.
- [ ] pathname이 정확히 `/account`일 때만 안내 표시. 진입 시 refreshAccount를 호출하며 재조회 완료 전 오래된 계정 정보로 팝업을 열지 않는다.
- [ ] 설계서 문구와 “확인했어요” 버튼 적용. 실패/오래된 버전은 다시 조회하거나 재시도 가능하게 표시한다. 확인 저장 실패 시 팝업을 닫지 않는다.
- [ ] 마이페이지 진입, 확인, 재진입 시 미표시, 재승격 시 재표시를 관련 DB 검증과 화면으로 확인한다. 장시간 반복 테스트는 하지 않는다.
- [ ] 타입 검사 및 변경 diff 확인 후 적용/미적용(DB, 관리자 지정, 배포)을 구분해 보고한다.

## Execution

이 세션에서 순서대로 직접 구현한다. 작업별 새 에이전트나 별도 테스트 인프라를 만들지 않는다. 기존 작업이 연결된 현재 브랜치에서 진행하고 사용자 변경을 덮어쓰지 않는다. 계획 승인 후 구현을 시작한다.
