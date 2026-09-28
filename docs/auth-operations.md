# 카카오 회원 운영 메모

## 현재 범위

회원 로그인 / 직접 상담 묶음 저장·조회·삭제 / 슈퍼 계정 안내의 구현이다.
실제 결제, 광고 완료 검증, 시트 지급·차감, 유료 해설 접근 제한은 아직 적용하지 않는다.
로그인한 회원이 직접 저장을 확정한 경우만 상담을 DB에 보관한다. 월별 타로도 포함한다.
비회원은 저장 API와 DB RPC에서 거부한다. 슈퍼 계정은 자동 저장 없이 직접 저장할 때 원문/키워드를 선택한다. 키워드 선택 시 모든 상담의 question 필드를 요청 전과 서버에서 제거하며 카드·해설은 그대로 남긴다. 해설은 Gemini 처리 대상이며 공급자의 보관 정책은 별개다.

`202609270002_super_manual_save.sql`은 슈퍼 계정의 본인 기록 저장·조회·삭제를 허용하는 후속 마이그레이션이다. 2026-09-27 사용자 승인 후 bbxuxalrlqhcwfvcypde에 적용했다. 합성 계정 트랜잭션으로 슈퍼 계정 원문/키워드 저장·조회·삭제, 타인 기록 조회/삭제 차단, 역할 변경 및 비회원 저장 차단을 확인했다. 롤백 후 잔여 테스트 사용자 0, RLS 활성화와 직접 INSERT/UPDATE 차단 모두 true였다. 실제 사용자 기록은 변경하지 않았다.

## 연결 순서 (DB 적용 완료, OAuth 설정 완료·사용자 로그인 확인 대기)

2026-09-27 진행 상태: 카카오 로그인 ON, 닉네임은 선택 동의(목적: 회원 화면에서 사용할 이름 표시), 프로필 사진·이메일·전화번호 등 추가 항목은 요청하지 않는다. REST 키의 로그인 리다이렉트 URI에 Supabase callback 등록을 저장 후 확인했다. Supabase Site URL은 `https://tarotart.vercel.app`로 변경했고 운영/localhost의 정확한 `/auth/callback` 두 주소를 추가했다. 기존 허용 URL 4개는 보존했다. 사용자가 Client Secret을 발급·활성화한 뒤 Supabase에 등록했으며 Kakao provider Enabled, Allow users without an email ON으로 저장했다. 비밀키는 저장소에 기록하지 않는다. 로컬 회원 이용 버튼에서 카카오 동의 화면(회원번호 + 선택 닉네임만)까지 확인했고 사용자가 직접 계속하기를 누르도록 남겨뒀다. 인증 복귀·세션 검증과 배포는 아직 미완료다. 카카오의 연결 해제 웹훅도 공개 운영 전 별도 구현·설정이 필요하다.

연동 검증 중 Supabase가 `options.scopes`에 기본 account_email/profile_image를 더해 KOE205가 발생했다. AuthProvider에서 `queryParams: { scope: "profile_nickname" }`으로 provider scope를 지정한 뒤 같은 버튼으로 재검증하여 오류 없이 최소 동의 화면 도달을 확인했다. 상태값·PKCE·콜백 검증은 기존 Supabase 흐름을 그대로 사용한다. 타입 검사 통과. 이 수정은 아직 로컬 변경이다.

1. Kakao 앱 1283085(타로타르트) 로그인 활성화. 필요한 최소 동의항목만 사용한다.
2. REST 키의 로그인 Redirect URI에 `https://bbxuxalrlqhcwfvcypde.supabase.co/auth/v1/callback` 등록.
3. Client Secret 생성/활성화와 Supabase Kakao provider 등록은 권한 변경 확인 후 진행. 키는 Git·채팅·공개 환경변수에 남기지 않는다.
4. Supabase provider에서 이메일 없는 로그인 허용. 프로필 닉네임만 요청하며 이메일·전화번호는 요청하지 않는다.
5. Supabase Site URL `https://tarotart.vercel.app`, 앱 Redirect 허용 목록에 `https://tarotart.vercel.app/auth/callback`, `http://localhost:3000/auth/callback`만 추가. 기존 필요한 값은 보존하며 wildcard는 사용하지 않는다.
6. 2026-09-27 사용자 승인 후 `supabase/migrations/202609270001_membership.sql`을 프로젝트 bbxuxalrlqhcwfvcypde에 적용했다. `supabase/tests/membership.sql`의 합성 데이터 트랜잭션 검증도 통과했다. 최종 확인: RLS 활성화, 비회원 조회/저장 금지, 회원 role 변경/직접 INSERT/UPDATE 금지 모두 true, 잔여 테스트 사용자·상담 0개. 기존 타로 해석 테이블은 수정하지 않았다.
7. Vercel의 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 확인. 서버는 사용자의 검증된 세션과 RLS를 사용하며 service-role 키가 필요하지 않다.
8. 운영자 Kaan, 문의 kaanzy@naver.com, 서비스 피드백 https://open.kakao.com/o/sIZKvBPi를 사용자에게 받아 안내에 반영했다. 실제 카카오 로그인 동의/복귀와 정책의 나머지 운영 항목 확인 후 공개 배포. 아직 OAuth 설정·로그인 통합 검증·배포는 미완료다.

## 슈퍼 권한 부여

대상자가 먼저 자기 카카오 계정으로 로그인한 후, 운영자가 확인한 정확한 auth.users UUID에만 권한을 준다. 공유 비밀번호/공용 카카오 계정은 만들지 않는다.
member_accounts의 role은 브라우저에서 수정할 수 없다. 운영자 DB 작업은 대상 UUID를 사용자에게 확인받고 수행한다.
후속 마이그레이션 적용 후에는 기존 저장 기록을 유지한 채 super로 변경할 수 있다. 기존 기록을 임의로 삭제하지 않는다.
super_notice_ack_at이 한 번 설정되면 로그아웃·캐시 삭제 후에도 안내가 반복되지 않는다.

## 보안 경계

2026-09-27 사용자 요청에 따라 `202609270003_mypage.sql` 운영 DB 적용 완료. 시트 잔량·일별 보상/사용·대표 카드·이용내역 권한 검증을 롤백 트랜잭션으로 통과했다. 실제 로그인 세션에서 `/select`의 무료/유료 시트 잔량 조회도 확인했다. 미연결 결제/광고를 통해 임의 시트를 발급하지 않는다.

계정 저장 API는 서버 인증 + 소유자 확인 + DB 권한을 함께 적용한다. public RPC도 payload와 현재 역할을 검사한다.
본인 기록만 조회/삭제 가능하며, 저장은 고정된 본인 ID만 사용한다. 역할 변경과 저장은 같은 회원 행 잠금으로 직렬화한다.
계정 전환 시 메모리 상담을 초기화하고 민감 HTML을 PWA 캐시에 넣지 않는다.
운영자는 DB에 기술적으로 접근 가능하다. 종단간 암호화나 침해 불가능을 보장하지 않는다.
일반 사용자 입력을 CSS로 처리하지 않지만 기존 의존성 감사 경고가 남아 있다. 로그인 경계 검증과 별개로 호환성 확인 후 의존성 보안 업데이트가 필요하다.
