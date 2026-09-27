# Kakao Membership Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking. Preserve the user's preference for sequential work without parallel agents or unrelated testing.

**Goal:** 카카오 로그인, 회원/비회원 홈, 회원의 직접 상담 저장, 지인용 슈퍼 권한과 최초 안내를 구현한다.

**Architecture:** 기존 Supabase Auth에 Kakao OAuth를 연결한다. Next.js 서버에서 사용자를 검증하고 회원 정보 및 상담 기록에는 RLS를 적용한다. 결제·광고·잔액 지급은 후속 단계이며 이번에 성공한 것처럼 구현하지 않는다.

**Tech Stack:** Next.js 15.5.24, React 19, styled-components, Zustand, 기존 supabase-js 및 @supabase/ssr.

**Spec:** docs/superpowers/specs/2026-09-27-membership-design.md

## Global Constraints

- 모바일 최소 280px. 기존 미배포 상담 기록·묶음 다운로드 변경 및 untracked data/ 보존.
- 집계 수정, 과금 전환, 임의 유료 호출, 실제 결제, 임의 슈퍼 계정 지정 제외.
- 회원만 직접 저장. 비회원·super는 DB/API 모두 상담 저장 금지.
- 질문/해설/토큰/키를 로그·분석 이벤트에 기록하지 않는다. 관리자도 볼 수 없는 암호화라고 주장하지 않는다.
- 슈퍼 팝업은 SUPER ACCOUNT!! / 작성하신 질문과 타로 해설은 별도로 저장하지 않아요. 안심하고 마음껏 무료로 즐겨주세요. / 확인.
- 순차 실행, 변경 범위 내 검증만 수행. 광범위 리팩터링과 전체 기능 회귀 작업 금지.

## Review Focus

- 캐시 삭제, 만료 쿠키, 카카오 로그인 취소: 잘못된 계정/권한을 보이지 않고 재로그인 가능 — Task 1.
- PWA 오프라인 또는 사용자 교체: 이전 사용자 기록이 캐시나 메모리로 노출되지 않음 — Tasks 1, 3.
- API 직접 호출, user_id/role 변조: 다른 사용자 열람 및 super 승격/저장 불가 — Task 2.
- 저장 버튼 연타와 연계 질문 추가: 중복 기록 대신 동일 묶음 갱신, 최신 버전 유지 — Tasks 2, 3.
- super 확인 저장 실패: 영구 확인된 것으로 오인하지 않고 재시도, 다음 로그인에는 성공한 확인만 유지 — Task 3.

## Task 1: 인증과 민감 화면 캐시 경계

**Files:** package.json/package-lock.json, lib/auth/browser.ts, lib/auth/server.ts, lib/auth/redirect.ts, middleware.ts, app/auth/callback/route.ts, app/auth/error/page.tsx, public/sw.js, tests/authRedirect.test.ts, tests/authCache.test.ts.

**Interfaces:** createAuthBrowserClient(): SupabaseClient; createAuthServerClient(): Promise<SupabaseClient>; safeAuthReturnPath(value: string | null): string (기본 /, //와 외부 주소 거부). Next.js 15는 proxy.ts가 아니라 middleware.ts 사용.

- [ ] redirect 테스트부터 작성: `assert.equal(safeAuthReturnPath('//evil.test'), '/')`, 외부 https 주소도 /, 허용한 내부 /account는 유지. 미구현으로 실패 확인.
- [ ] @supabase/ssr를 추가하고 공식 쿠키 기반 PKCE 클라이언트 및 세션 갱신 구현. 서버는 getUser 또는 검증된 getClaims로 인증하며 getSession만 신뢰하지 않음. 최신 역할은 DB 조회. 다른 목적의 기존 공개 카드 조회 클라이언트는 변경하지 않음.
- [ ] OAuth callback의 code 교환 후 허용된 내부 경로로 이동. 실패/취소는 일반적인 재시도 안내만 표시. code와 provider token을 URL 로그/Analytics에 남기지 않도록 callback은 즉시 서버 redirect, 비밀 오류 원문 미노출.
- [ ] SW 테스트는 제어된 fetch/cache로 실제 핸들러를 실행: /auth/*, /account/*, /result, /api/* 요청에 cache.put 호출 없음. 홈은 공개 UI만 캐시 가능하며 쿠키 기반 개인화 HTML은 캐시하지 않음. 로그인에 의존한 navigation은 network-only + 안전한 offline.html. 기존 앱 이름 prefix 캐시만 버전 갱신으로 정리. SSR/RSC와 회원 API는 private,no-store.
- [ ] 두 테스트와 npm run typecheck 실행. 변경 파일만 커밋.

## Task 2: 회원·저장 기록 DB 및 서버 경계

**Files:** supabase/migrations/202609270001_membership.sql, lib/auth/member.ts, util/validateSavedConsultation.ts, app/api/account/route.ts, app/api/account/super-notice/route.ts, app/api/consultations/route.ts, app/api/consultations/[id]/route.ts, tests/savedConsultation.test.ts, supabase/tests/membership.sql.

**Interfaces:** Account = { id: string; role: 'member' | 'super'; superNoticeAcknowledged: boolean }; requireAccount(): Promise<Account> (인증되지 않으면 401); 저장 payload = { consultationId: UUID; revision: integer; readings: ReadingExport[] }. 목록 GET은 ID·저장일·키워드만, 상세 GET은 묶음 내용. 저장 POST, 삭제 DELETE. 역할을 요청 body에서 받지 않음.

- [ ] 검증 테스트: 정상 묶음 허용, HTML을 실행하지 않는 일반 문자열, 임의 owner/role 필드 및 1MB 초과/음수 revision/잘못된 cardId 거부. 빈 readings 거부. node 테스트를 실패부터 확인.
- [ ] migration 작성: member_accounts(user_id PK references auth.users, role default member, super_notice_ack_at, created_at). 신규 auth 사용자 trigger 및 기존 사용자 idempotent 초기화. authenticated는 본인 SELECT만, role 직접 UPDATE 권한 없음.
- [ ] saved_consultations(id UUID, user_id, consultation_id UUID, revision, readings JSONB, created_at, updated_at, UNIQUE(user_id,consultation_id)); RLS SELECT/DELETE/INSERT/UPDATE 모두 auth.uid()=user_id AND 현재 member 역할. 서버도 동일 검사. SECURITY DEFINER가 필요한 좁은 RPC는 search_path 고정, auth.uid 기반, 역할 인자 불허. super 확인 RPC는 본인 super_notice_ack_at만 최초 갱신.
- [ ] 계정/기록 API 구현: same-origin 변경 요청 검증, 인증 실패 401/권한 실패 403, 다른 소유자 ID는 404. JSON 크기를 스트림 읽기 단계부터 제한. 데이터 요청은 캐시 금지. 오래된 revision이 최신 기록을 덮어쓰지 않게 조건부 저장. 실패 로그는 코드만 남김.
- [ ] DB 트랜잭션 테스트는 합성 사용자 A/B/super로 수행 후 rollback: A→B 읽기/삭제 차단, anon 저장 차단, super 저장 차단, A의 role 업데이트 차단, 중복 consultation_id 1행, 낮은 revision 거부. 운영 실제 상담은 사용하지 않음.
- [ ] 관련 테스트/타입 검사 후 변경 파일 커밋. 외부 DB 적용은 Task 4에서 수행.

## Task 3: 회원 진입·기록 UI·슈퍼 안내

**Files:** components/auth/AuthProvider.tsx, components/home/MemberEntry.tsx, components/auth/SuperWelcome.tsx, components/home/HomeLanding.tsx, app/layout.tsx, app/account/page.tsx, app/account/readings/[id]/page.tsx, components/result/PersonalReadingResult.tsx, components/result/ReadingSaveButtons.tsx, store/useReadingSessionStore.ts, util/handleResetStore.ts, tests/readingSession.test.ts.

**Interfaces:** useAuth(): { status: 'loading'|'guest'|'member'|'super'; account: Account|null; signIn(): Promise<void>; signOut(): Promise<void>; refreshAccount(): Promise<void> }. 시트 잔액 API는 이 단계에서 만들지 않는다. 상담 session에 consultationId/revision과 accountSavedRevision을 유지한다.

- [ ] session 테스트 추가: 로그아웃/사용자 전환 시 질문·기록·저장 상태 초기화. 새로운 연계 질문 후에는 다시 저장 필요, 같은 revision 재저장은 중복되지 않음.
- [ ] AuthProvider에서 로그인 복원, 실패 및 loading 상태, 계정 전환 시 메모리/파일 URL 폐기 구현. 최초 guest→member 로그인은 새 상담 시작 전에 수행하며 다른 사용자의 기록과 연결하지 않음.
- [ ] 홈 시작 링크를 MemberEntry로 교체. 회원/비회원 버튼, 승인된 혜택 팝업, 로그인 후 시작/내 기록/로그아웃. 광고·결제 미연동 상태는 준비 중으로 구분해 안내.
- [ ] SuperWelcome: DB role이 super이고 미확인일 때만 native dialog 및 짧은 CSS 폭죽, reduced-motion 대응. 확인 API 성공 후 닫고 실패 시 재시도 안내. 일반 회원은 클라이언트 값을 변경해도 super 판정 불가.
- [ ] 회원에게만 '내 기록에 저장' 제공. 최초 질문→카드→해설→연계 질문 묶음을 저장하며 명시적 클릭 없이 업로드하지 않는다. super는 저장 UI도 숨기고 API도 거부. 저장 성공 revision이면 홈 이탈 시 미저장 경고를 반복하지 않되 추가 상담 뒤에는 다시 안내한다.
- [ ] 내 기록 목록/상세/삭제 확인 및 기존 ReadingSaveButtons로 전체 내려받기. 저장 옵션 설명과 실제 데이터 형태 일치. DB 삭제가 백업까지 즉시 제거한다는 주장은 하지 않는다.
- [ ] 280px와 일반 모바일 폭에서 로그인 버튼, 두 native dialog, 키보드 입력, 기록 다시 보기 확인. API는 합성 해설 사용, Gemini 호출 없음. 타입 검사 후 변경 파일만 커밋.

## Task 4: 브라우저 설정과 통합 확인

**Files:** docs/auth-operations.md; 필요한 운영 환경변수는 Vercel에만 등록하고 값은 문서에 남기지 않음.

- [ ] 현재 앱/프로젝트를 다시 식별하고 Kakao 로그인 활성화, 최소 동의항목, REST 키 Client Secret 활성화, https://bbxuxalrlqhcwfvcypde.supabase.co/auth/v1/callback 등록. 기존 공유용 설정/키는 삭제·교체하지 않는다. 사용자 인증/약관 동의는 사용자에게 넘김.
- [ ] Supabase Kakao 제공자에 해당 credentials 등록 및 이메일 없는 사용자 허용. Site URL https://tarotart.vercel.app, redirect allow list는 https://tarotart.vercel.app/auth/callback 과 http://localhost:3000/auth/callback 만 추가. 기존 필요한 값은 보존, wildcard 허용 안 함.
- [ ] Vercel 공개 Supabase URL/anon key 변수 존재 확인(값 출력 금지). 회원 API는 사용자 세션+RLS로 처리해 서비스 키 사용 최소화. 서비스 키를 NEXT_PUBLIC 변수로 등록하지 않는다.
- [ ] migration 검토 후 기존 Supabase에 적용, rollback 가능한 합성 RLS 테스트 확인. supers 지정은 사용자에게 실제 가입한 UUID를 확인받은 이후만 실행, 명단을 Git에 남기지 않는다.
- [ ] 기존 개인정보 안내 위치를 확인하고, 없으면 app/privacy/page.tsx를 추가해 수집 정보·상담 직접 저장·삭제·Gemini 처리 사실 안내. 운영자 연락처/정책의 미확정 사실은 꾸며내지 말고 사용자에게 요청. 실제 사용자 가입 공개 전 확인 필요.
- [ ] 사용자가 직접 카카오 OAuth 동의를 마친 뒤 복귀·새로고침·로그아웃·재로그인·권한·기록 접근 확인. MFA는 권장하되 승인 없이 강제 설정하거나 복구 코드를 취급하지 않음.
- [ ] 개발 서버와 빌드가 .next를 공유하지 않게 실행 중인 소유 dev 세션을 멈추고 npm run build. 관련 테스트만 실행. 사용자 배포 승인 확인 후 push, Vercel 성공 상태와 실제 콜백/로그인 화면 확인. 결제·광고 미연동 사실을 최종 안내.

## Self-review

기존 작업 보존, 권한의 서버/DB 검증, 본인 기록만 접근, 슈퍼 미저장, 키 노출 방지, PWA 캐시, 1회 팝업, 모바일 폭, 실제 결제·광고 분리 모두 위 작업에 연결했다. 기본적인 접근 제어와 저장 경계만 다루며 보안 완벽/침해 불가능을 보장하지 않는다. 현재 계획 검토 전이므로 외부 설정은 아직 변경하지 않는다.
