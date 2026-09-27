# 카카오 회원 운영 메모

## 현재 범위

회원 로그인 / 직접 상담 묶음 저장·조회·삭제 / 슈퍼 계정 안내의 구현이다.
실제 결제, 광고 완료 검증, 시트 지급·차감, 유료 해설 접근 제한은 아직 적용하지 않는다.
일반 회원이 저장을 누른 경우만 상담을 DB에 보관한다. 월별 타로도 포함한다.
슈퍼 계정 및 비회원은 저장 API와 DB RPC에서 거부한다. 해설은 Gemini 처리 대상이며 공급자의 보관 정책은 별개다.

## 연결 순서 (DB 적용 완료, OAuth 연결 대기)

1. Kakao 앱 1283085(타로타르트) 로그인 활성화. 필요한 최소 동의항목만 사용한다.
2. REST 키의 로그인 Redirect URI에 `https://bbxuxalrlqhcwfvcypde.supabase.co/auth/v1/callback` 등록.
3. Client Secret 생성/활성화와 Supabase Kakao provider 등록은 권한 변경 확인 후 진행. 키는 Git·채팅·공개 환경변수에 남기지 않는다.
4. Supabase provider에서 이메일 없는 로그인 허용. 프로필 닉네임만 요청하며 이메일·전화번호는 요청하지 않는다.
5. Supabase Site URL `https://tarotart.vercel.app`, 앱 Redirect 허용 목록에 `https://tarotart.vercel.app/auth/callback`, `http://localhost:3000/auth/callback`만 추가. 기존 필요한 값은 보존하며 wildcard는 사용하지 않는다.
6. 2026-09-27 사용자 승인 후 `supabase/migrations/202609270001_membership.sql`을 프로젝트 bbxuxalrlqhcwfvcypde에 적용했다. `supabase/tests/membership.sql`의 합성 데이터 트랜잭션 검증도 통과했다. 최종 확인: RLS 활성화, 비회원 조회/저장 금지, 회원 role 변경/직접 INSERT/UPDATE 금지 모두 true, 잔여 테스트 사용자·상담 0개. 기존 타로 해석 테이블은 수정하지 않았다.
7. Vercel의 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 확인. 서버는 사용자의 검증된 세션과 RLS를 사용하며 service-role 키가 필요하지 않다.
8. 운영자 Kaan, 문의 supremer12@gmail.com, 서비스 피드백 https://open.kakao.com/o/sIZKvBPi를 사용자에게 받아 안내에 반영했다. 실제 카카오 로그인 동의/복귀와 정책의 나머지 운영 항목 확인 후 공개 배포. 아직 OAuth 설정·로그인 통합 검증·배포는 미완료다.

## 슈퍼 권한 부여

대상자가 먼저 자기 카카오 계정으로 로그인한 후, 운영자가 확인한 정확한 auth.users UUID에만 권한을 준다. 공유 비밀번호/공용 카카오 계정은 만들지 않는다.
member_accounts의 role은 브라우저에서 수정할 수 없다. 운영자 DB 작업은 대상 UUID를 사용자에게 확인받고 수행한다.
기존 저장 기록이 있는 회원은 바로 super로 변경되지 않는다. 삭제 여부를 별도로 확인받아야 하며 임의로 지우지 않는다.
super_notice_ack_at이 한 번 설정되면 로그아웃·캐시 삭제 후에도 안내가 반복되지 않는다.

## 보안 경계

계정 저장 API는 서버 인증 + 소유자 확인 + DB 권한을 함께 적용한다. public RPC도 payload와 현재 역할을 검사한다.
본인 기록만 조회/삭제 가능하며, 저장은 고정된 본인 ID만 사용한다. 역할 변경과 저장은 같은 회원 행 잠금으로 직렬화한다.
계정 전환 시 메모리 상담을 초기화하고 민감 HTML을 PWA 캐시에 넣지 않는다.
운영자는 DB에 기술적으로 접근 가능하다. 종단간 암호화나 침해 불가능을 보장하지 않는다.
일반 사용자 입력을 CSS로 처리하지 않지만 기존 의존성 감사 경고가 남아 있다. 로그인 경계 검증과 별개로 호환성 확인 후 의존성 보안 업데이트가 필요하다.
