# 타로 해석 데이터베이스 설계

## 목표

`images/`의 스캔본을 78장 타로 카드의 기본 해석 자료로 재구성하고, 이를 바탕으로 주제별로 충분히 입체적인 결과를 미리 생성해 Supabase에 저장한다. 앱 실행 중에는 AI를 호출하지 않는다. 현재 서비스는 정방향만 사용하고 역방향 데이터는 이후 기능 확장을 위해 함께 보관한다.

스캔본 문장을 사용자에게 그대로 노출하지 않는다. 핵심 의미를 구조화한 내부 기본 자료와 이를 새롭게 풀어쓴 서비스용 해석을 분리한다.

## 데이터 구조

### `tarot_card_profiles`

카드 한 장당 한 행, 총 78행이다.

- `card_id`: 앱의 카드 번호와 연결되는 기본 키
- `name_ko`, `name_en`
- `arcana`, `suit`, `rank`
- `upright_keywords`, `reversed_keywords`: 문자열 배열
- `upright_one_line`, `reversed_one_line`
- 생성·수정 시각

### `tarot_base_interpretations`

스캔본을 구조화하고 재서술한 내부 기본 자료다. 카드 한 장당 한 행, 총 78행이다.

- `card_id`: `tarot_card_profiles.card_id`를 참조하며 유일함
- `upright`, `reversed`: JSONB
- 각 방향은 `overview`, `current_situation`, `emotion`, `cause`, `future`, `advice`, `love`, `career`, `relationships`, `other` 필드를 가짐
- `source_files`: 변환에 사용한 원본 파일명 배열
- 생성·수정 시각

이 테이블은 브라우저에서 직접 읽을 수 없도록 한다.

### `tarot_topic_readings`

카드·주제·방향별 서비스용 해석이다. 78장 × 8개 주제 × 2개 방향으로 총 1,248행을 저장한다.

- `card_id`: 카드 프로필 참조
- `topic_id`: 현재 앱의 8개 주제 식별자
- `orientation`: `upright` 또는 `reversed`
- `headline`, `core_message`, `emotional_layer`, `hidden_context`
- `challenge`, `opportunity`, `near_future`, `advice`, `reflection_question`
- 생성·수정 시각
- `(card_id, topic_id, orientation)` 복합 유일 제약

## 해석 작성 원칙

문체는 따뜻하지만 구체적인 상담형으로 통일한다. 미래를 확정적으로 예언하지 않고 카드가 보여주는 가능성으로 표현한다. 핵심 메시지뿐 아니라 감정, 숨은 맥락, 어려움, 기회, 가까운 흐름, 실행 가능한 조언과 스스로 생각할 질문을 제공한다.

스캔본은 의미의 기준으로만 사용하고 서비스 문장은 그대로 복제하지 않고 재구성한다. 카드의 전통적인 상징과 스캔본의 의미가 충돌할 경우 스캔본을 기본으로 삼되 단정적이거나 위협적인 표현은 완화한다.

## 변환과 저장 흐름

1. 100개 스캔 파일을 메이저 22장과 마이너 56장의 `card_id`에 연결한다.
2. 각 카드에서 정방향·역방향 기본 의미를 공통 필드로 추출하고 재서술한다.
3. 카드별 키워드와 한 줄 해석을 만든다.
4. 바보, 컵 에이스, 소드 에이스, 펜타클 에이스, 완드 에이스 5장으로 구조와 문체를 먼저 점검한다.
5. 같은 규칙으로 나머지 73장을 처리한다.
6. 세 테이블에 멱등 방식으로 일괄 저장한다.
7. DB 행 수와 필수값을 확인하고 앱 조회를 검증한다.
8. 검증이 끝나면 프로젝트의 `images/` 스캔본을 삭제한다. Git에 스캔본을 추가하지 않는다.

## 앱 조회와 보안

앱은 서버 API를 통해 `card_id`, `topic_id`, 현재 방향인 `upright`에 맞는 `tarot_topic_readings` 한 행을 조회한다. 스캔 기반 내부 자료는 공개하지 않는다. 공개 클라이언트 키로 `tarot_base_interpretations`를 직접 읽을 수 없도록 RLS 정책을 설정한다.

주제별 해석이 없거나 조회가 실패하면 `tarot_card_profiles.upright_one_line`과 일반 안내 문구를 대체 결과로 표시한다. 사용자에게 빈 결과 화면이나 내부 오류 정보를 노출하지 않는다.

## 범위와 최소 검증

이번 작업은 세 테이블 생성, 78장 데이터 변환과 저장, 현재 정방향 결과 조회 연결, 결과 화면 반영, 스캔본 제거까지 포함한다. 실시간 AI 호출, 역방향 카드 선택 UI, 관리자 편집 화면은 제외한다.

검증은 다음으로 제한한다.

- 프로필 78행, 기본 해석 78행, 주제별 해석 1,248행 확인
- 카드·주제·방향 중복과 필수값 누락 확인
- 정상 결과 조회 1건과 대체 결과 1건 확인
- TypeScript 타입 검사
- 최소 280px 모바일 결과 화면에서 레이아웃 확인

