do $$
declare
  updated_row_count integer;
begin
  with position_definitions (
    reading_type,
    layout_id,
    position_id,
    role,
    headline,
    position_lead,
    position_summary,
    position_detail,
    reflection_question
  ) as (
    values
      (
        'one', 'single', 'message', 'message',
        '오늘 카드가 건네는 이야기',
        null,
        '오늘은 이 카드가 비추는 장면을 질문하신 현실에 조용히 연결해보세요.',
        '카드의 상징을 멀리 있는 예언보다 지금 마음이 알아차릴 수 있는 신호로 받아들여보세요.',
        '이 카드가 오늘 가장 먼저 돌보라고 건네는 마음은 무엇일까요?'
      ),
      (
        'three', 'timeline', 'past', 'past',
        '지나온 흐름에 남은 카드의 이야기',
        '지나온 시간에는 카드가 비추는 장면이 지금의 선택과 감정에 분명한 흔적을 남겼어요.',
        '그때의 경험이 오늘의 판단에 어떤 기준을 남겼는지 천천히 돌아보세요.',
        '이미 끝난 일과 아직 마음에 남은 영향을 나누어 보면 현재를 더 가볍게 선택할 수 있어요.',
        '지나온 경험 가운데 지금도 내 선택에 영향을 주는 장면은 무엇일까요?'
      ),
      (
        'three', 'timeline', 'present', 'present',
        '지금 이 순간 카드가 비추는 흐름',
        '지금 이 순간에는 카드가 가리키는 반응과 조건이 눈앞에 또렷이 드러나고 있어요.',
        '바로 확인할 수 있는 사실부터 차분히 바라보면 지금 필요한 선택이 선명해져요.',
        '마음의 해석과 실제로 일어난 일을 구분해보면 현재 흐름의 중심을 놓치지 않을 수 있어요.',
        '지금 가장 분명하게 확인할 수 있는 사실은 무엇일까요?'
      ),
      (
        'three', 'timeline', 'future', 'future',
        '앞으로 열릴 수 있는 카드의 흐름',
        '지금의 선택이 이어진다면 카드가 비추는 다음 가능성이 열릴 수 있어요.',
        '아직 정해지지 않은 미래인 만큼 오늘 준비할 수 있는 한 걸음에 마음을 모아보세요.',
        '가능성을 결과로 단정하지 말고 현재의 선택이 어떤 방향을 키우는지 살펴보는 것이 중요해요.',
        '바라는 가능성을 위해 오늘 준비할 수 있는 한 가지는 무엇일까요?'
      ),
      (
        'three', 'problem', 'situation', 'present',
        '문제의 중심에 놓인 카드의 이야기',
        '지금 문제의 중심에는 카드가 보여주는 조건과 반응이 분명하게 드러나고 있어요.',
        '해결을 서두르기 전에 현재 상황에서 이미 확인된 사실부터 정리해보세요.',
        '문제 전체를 한꺼번에 풀기보다 지금 가장 크게 작동하는 한 지점을 찾으면 실마리가 보여요.',
        '현재 상황에서 내가 사실로 확인한 것은 무엇일까요?'
      ),
      (
        'three', 'problem', 'obstacle', 'blocker',
        '흐름을 막는 신호를 비추는 카드',
        null,
        '지금 흐름을 막는 신호를 가볍게 넘기지 말고 속도를 늦춰 살펴보세요.',
        '반복해서 걸리는 장면을 인정할수록 어디에서 멈추고 방향을 바꿔야 할지 또렷해져요.',
        '이 문제에서 내가 피하거나 멈춰야 할 신호는 무엇일까요?'
      ),
      (
        'three', 'problem', 'advice', 'advice',
        '문제를 풀 실마리를 건네는 카드',
        null,
        '카드가 건네는 조언 가운데 오늘 바로 옮길 수 있는 작은 행동을 골라보세요.',
        '거창한 해답보다 지금 감당할 수 있는 한 걸음이 흐름을 현실적으로 바꾸기 시작해요.',
        '오늘 실천할 수 있는 가장 작고 분명한 행동은 무엇일까요?'
      ),
      (
        'three', 'relationship', 'self', 'context',
        '내 마음을 비추는 카드의 이야기',
        null,
        '내 마음과 태도가 지금 상황에 미치는 영향을 살펴보세요.',
        '바라는 것과 두려워하는 것을 함께 인정하면 관계 안에서 내가 선택할 수 있는 몫이 보여요.',
        '이 관계에서 내가 솔직히 인정해야 할 마음은 무엇일까요?'
      ),
      (
        'three', 'relationship', 'other', 'context',
        '상대의 흐름을 비추는 카드의 이야기',
        null,
        '상대의 말만이 아니라 반복되는 행동과 거리의 변화를 함께 살펴보세요.',
        '짐작으로 빈칸을 채우지 않을 때 상대에게 실제로 작동하는 흐름을 더 차분히 읽을 수 있어요.',
        '상대의 마음을 추측하지 않고 확인할 수 있는 행동은 무엇일까요?'
      ),
      (
        'three', 'relationship', 'connection', 'present',
        '두 사람 사이를 비추는 카드의 흐름',
        '지금 두 사람 사이에는 카드가 가리키는 거리와 반응이 분명하게 드러나고 있어요.',
        '서로의 마음을 단정하기보다 실제로 오가는 말과 행동의 균형을 확인해보세요.',
        '각자의 입장보다 두 사람 사이에서 반복되는 방식이 관계의 현재 방향을 보여줘요.',
        '두 사람 사이에서 지금 가장 솔직하게 나눠야 할 것은 무엇일까요?'
      ),
      (
        'three', 'choice', 'option-a', 'context',
        '첫 번째 선택이 보여주는 카드의 흐름',
        null,
        '첫 번째 길이 주는 가능성과 함께 감당해야 할 조건도 차분히 바라보세요.',
        '마음이 끌리는 이유와 실제 비용을 나란히 놓으면 이 선택의 현실적인 모습이 보여요.',
        '첫 번째 선택에서 얻는 것과 감당할 것은 각각 무엇일까요?'
      ),
      (
        'three', 'choice', 'option-b', 'context',
        '두 번째 선택이 보여주는 카드의 흐름',
        null,
        '두 번째 길이 열어주는 변화와 그 안의 부담을 함께 살펴보세요.',
        '익숙함이나 새로움 한쪽에만 끌리지 말고 이 선택이 오래 유지될 수 있는지 확인해보세요.',
        '두 번째 선택은 내 일상에 어떤 변화와 책임을 가져올까요?'
      ),
      (
        'three', 'choice', 'decision-key', 'advice',
        '결정의 기준을 밝혀주는 카드',
        null,
        '두 길을 가르는 가장 중요한 기준을 한 문장으로 정리한 뒤 선택을 바라보세요.',
        '지금 지킬 가치와 감당할 수 있는 비용이 분명해지면 흔들리던 마음도 차츰 자리를 잡아요.',
        '어느 쪽을 택하더라도 끝까지 지키고 싶은 기준은 무엇일까요?'
      ),
      (
        'three', 'direction', 'no', 'blocker',
        '지금은 멈추라고 알리는 카드의 신호',
        null,
        '불편한 신호가 사라지기 전에는 밀어붙이지 않는 편이 마음과 현실을 함께 지켜줘요.',
        'NO는 운명의 거절이 아니라 지금 피해야 할 조건을 분명히 알아차리라는 안내예요.',
        '진행하기 전에 반드시 사라져야 할 위험 신호는 무엇일까요?'
      ),
      (
        'three', 'direction', 'hold', 'hold',
        '결정 전에 더 확인할 카드의 신호',
        null,
        '아직 빈칸으로 남은 사실을 확인할 때까지 결정을 잠시 미뤄두세요.',
        '보류는 포기가 아니라 말과 기대를 실제 정보와 반복되는 행동으로 검증하는 시간이에요.',
        '결정을 내리기 전에 사실로 확인해야 할 정보는 무엇일까요?'
      ),
      (
        'three', 'direction', 'yes', 'opening',
        '움직여도 좋을 때를 알리는 카드',
        null,
        '필요한 조건이 현실에서 확인된다면 감당할 수 있는 작은 단계부터 길을 열어보세요.',
        'YES는 무조건적인 약속이 아니라 준비와 안전이 함께 갖춰졌을 때 움직여도 좋다는 신호예요.',
        '안심하고 움직이기 위해 먼저 갖춰져야 할 조건은 무엇일까요?'
      ),
      (
        'celtic', 'celtic-cross', 'present', 'present',
        '질문의 중심을 비추는 카드',
        '지금 질문의 중심에는 카드가 가리키는 흐름과 조건이 분명하게 드러나고 있어요.',
        '현재 가장 크게 작동하는 사실을 인정하면 복잡한 이야기의 중심이 차분히 잡혀요.',
        '다른 위치를 읽기 전에 지금 실제로 벌어지는 일과 마음의 반응을 나누어 살펴보세요.',
        '지금 이 질문의 중심에서 가장 분명한 사실은 무엇일까요?'
      ),
      (
        'celtic', 'celtic-cross', 'obstacle', 'blocker',
        '질문의 장애물을 비추는 카드',
        null,
        '계속 걸리는 신호를 무시하지 말고 어디에서 속도를 늦춰야 하는지 살펴보세요.',
        '장애물은 나를 벌주는 벽보다 지금 방식으로는 지나가기 어렵다는 현실적인 안내에 가까워요.',
        '현재 흐름에서 내가 멈추거나 다르게 다뤄야 할 것은 무엇일까요?'
      ),
      (
        'celtic', 'celtic-cross', 'root', 'context',
        '마음 깊은 원인을 비추는 카드',
        null,
        '겉으로 드러난 이유 아래에서 오래 움직여온 감정과 믿음을 조용히 살펴보세요.',
        '말로 설명하기 어려웠던 욕구를 인정하면 지금 선택이 왜 반복되는지도 이해할 수 있어요.',
        '이 상황 아래에서 오래 움직여온 진짜 마음은 무엇일까요?'
      ),
      (
        'celtic', 'celtic-cross', 'goal', 'context',
        '의식적인 바람을 비추는 카드',
        null,
        '내가 알고 있는 목표와 실제로 이루고 싶은 모습을 한데 놓고 바라보세요.',
        '바람을 구체적인 장면으로 그려보면 기대와 현실 사이에서 조정할 지점이 보여요.',
        '내가 분명히 바라고 있다고 말할 수 있는 결과는 무엇일까요?'
      ),
      (
        'celtic', 'celtic-cross', 'past', 'past',
        '현재에 남은 지난 흐름의 카드',
        '지나온 시간에는 카드가 비추는 사건과 감정이 현재의 질문에 깊은 흔적을 남겼어요.',
        '이미 지나간 일 가운데 지금도 선택의 기준이 되는 경험을 다정하게 돌아보세요.',
        '과거의 영향과 현재의 가능성을 구분할수록 오래된 반응에서 한 걸음 떨어질 수 있어요.',
        '지나간 경험 중 지금도 내 선택을 붙잡는 것은 무엇일까요?'
      ),
      (
        'celtic', 'celtic-cross', 'near-future', 'future',
        '가까운 변화를 비추는 카드',
        '현재의 흐름을 이어간다면 가까운 시기에는 카드가 보여주는 가능성이 열릴 수 있어요.',
        '아직 확정된 결론은 아니니 눈앞의 작은 변화가 어느 방향으로 이어지는지 살펴보세요.',
        '준비된 선택은 다가오는 변화를 더 편안하게 맞이할 여지를 만들어줘요.',
        '가까운 변화를 위해 지금 준비할 수 있는 것은 무엇일까요?'
      ),
      (
        'celtic', 'celtic-cross', 'self', 'context',
        '상황을 대하는 내 태도의 카드',
        null,
        '내가 취하고 있는 태도가 질문의 흐름을 어떻게 키우거나 늦추는지 살펴보세요.',
        '통제할 수 없는 바깥보다 지금 바꿀 수 있는 내 반응을 찾으면 선택의 힘이 돌아와요.',
        '이 상황에서 내가 선택할 수 있는 가장 건강한 태도는 무엇일까요?'
      ),
      (
        'celtic', 'celtic-cross', 'environment', 'context',
        '주변 환경을 비추는 카드',
        null,
        '상대와 외부 조건이 내 선택에 주는 도움과 부담을 함께 살펴보세요.',
        '내 마음만으로 바꿀 수 없는 조건을 인정하면 어디에 도움을 청해야 할지도 선명해져요.',
        '주변에서 실제로 도움을 주거나 제약을 만드는 조건은 무엇일까요?'
      ),
      (
        'celtic', 'celtic-cross', 'hopes-fears', 'context',
        '희망과 두려움을 함께 비추는 카드',
        null,
        '바라는 마음과 잃을까 두려운 마음이 같은 뿌리에서 움직이는지 살펴보세요.',
        '두 감정을 어느 하나 밀어내지 않고 함께 바라보면 진짜로 원하는 방향을 찾을 수 있어요.',
        '내 기대와 두려움이 동시에 가리키는 소망은 무엇일까요?'
      ),
      (
        'celtic', 'celtic-cross', 'outcome', 'future',
        '현재 선택이 이어질 때의 카드',
        '지금의 선택과 태도가 이어진다면 마지막 흐름에는 카드가 비추는 가능성이 열릴 수 있어요.',
        '이 결과는 정해진 운명보다 현재 조건을 계속 돌볼 때 가까워지는 방향으로 받아들여보세요.',
        '오늘의 작은 선택이 쌓이면 최종 흐름의 결도 충분히 달라질 수 있어요.',
        '바라는 결과에 가까워지기 위해 지금 바꿀 수 있는 한 가지는 무엇일까요?'
      ),
      (
        'horoscope', 'twelve-houses', 'self', 'present',
        '나 자신을 비추는 카드',
        '지금 내 모습에는 카드가 가리키는 태도와 에너지가 또렷이 드러나고 있어요.',
        '다른 사람의 시선보다 내가 실제로 느끼는 힘과 필요를 먼저 살펴보세요.',
        '나를 설명하는 익숙한 말에서 잠시 벗어나 지금의 상태를 있는 그대로 인정해보세요.',
        '지금의 나에게 가장 필요한 이해와 돌봄은 무엇일까요?'
      ),
      (
        'horoscope', 'twelve-houses', 'money', 'context',
        '재정의 흐름을 비추는 카드',
        null,
        '수입과 지출을 둘러싼 마음과 현실적인 조건을 함께 살펴보세요.',
        '막연한 기대나 불안보다 숫자와 기한을 확인하면 돈의 흐름을 차분히 다룰 수 있어요.',
        '지금 재정에서 가장 먼저 확인해야 할 숫자나 기한은 무엇일까요?'
      ),
      (
        'horoscope', 'twelve-houses', 'communication', 'context',
        '소통의 흐름을 비추는 카드',
        null,
        '전하고 싶은 마음과 실제로 건넨 말 사이의 거리를 살펴보세요.',
        '상대가 알아주길 기다리기보다 오해 없이 전할 수 있는 한 문장을 고르면 흐름이 달라져요.',
        '지금 더 분명하고 다정하게 전해야 할 말은 무엇일까요?'
      ),
      (
        'horoscope', 'twelve-houses', 'home', 'context',
        '가정과 안식처를 비추는 카드',
        null,
        '집과 가족 안에서 편안함을 주는 것과 에너지를 소모시키는 것을 나누어 보세요.',
        '작은 공간이나 관계의 경계를 정돈하는 일이 마음의 안전을 되찾는 시작이 될 수 있어요.',
        '내가 편안히 머물기 위해 바꾸고 싶은 집 안의 흐름은 무엇일까요?'
      ),
      (
        'horoscope', 'twelve-houses', 'creativity', 'context',
        '창의성과 기쁨을 비추는 카드',
        null,
        '잘해야 한다는 부담보다 마음이 자연스럽게 살아나는 활동을 떠올려보세요.',
        '작은 즐거움을 허락할수록 표현하고 사랑하는 힘도 다시 부드럽게 움직여요.',
        '결과와 상관없이 다시 즐겨보고 싶은 것은 무엇일까요?'
      ),
      (
        'horoscope', 'twelve-houses', 'routine', 'context',
        '일상과 몸의 리듬을 비추는 카드',
        null,
        '반복되는 일정과 몸의 신호가 지금의 에너지에 어떤 영향을 주는지 살펴보세요.',
        '거창한 변화보다 잠과 식사와 휴식 가운데 하나를 꾸준히 돌보는 편이 오래 가요.',
        '내 일상에서 가장 먼저 회복시켜야 할 리듬은 무엇일까요?'
      ),
      (
        'horoscope', 'twelve-houses', 'partnership', 'context',
        '파트너십의 균형을 비추는 카드',
        null,
        '서로 주고받는 책임과 기대가 한쪽으로 기울지 않았는지 살펴보세요.',
        '관계를 지키면서도 각자의 몫을 분명히 말할 때 신뢰가 더 편안하게 자라요.',
        '이 관계에서 다시 맞추고 싶은 약속이나 역할은 무엇일까요?'
      ),
      (
        'horoscope', 'twelve-houses', 'transformation', 'context',
        '변화와 놓아줌을 비추는 카드',
        null,
        '이제 역할을 다한 것과 새롭게 받아들일 것을 조용히 구분해보세요.',
        '끝을 붙잡기보다 변화가 남기는 힘을 알아차리면 다음 장면으로 갈 여유가 생겨요.',
        '지금 놓아줄 때 오히려 되찾을 수 있는 것은 무엇일까요?'
      ),
      (
        'horoscope', 'twelve-houses', 'growth', 'context',
        '성장과 넓은 시야를 비추는 카드',
        null,
        '익숙한 판단 밖에서 배우고 바라볼 수 있는 새로운 관점을 살펴보세요.',
        '멀리 가는 계획도 오늘 만나는 한 사람과 한 문장에서 시작될 수 있어요.',
        '지금의 시야를 넓혀줄 배움이나 경험은 무엇일까요?'
      ),
      (
        'horoscope', 'twelve-houses', 'career', 'context',
        '진로와 역할을 비추는 카드',
        null,
        '일에서 맡고 싶은 역할과 실제로 인정받는 강점이 어디에서 만나는지 살펴보세요.',
        '평가와 성과만 좇기보다 오래 이어갈 수 있는 방향을 고르면 다음 기회가 또렷해져요.',
        '앞으로의 일에서 더 분명히 맡고 싶은 역할은 무엇일까요?'
      ),
      (
        'horoscope', 'twelve-houses', 'community', 'context',
        '공동체와 연결을 비추는 카드',
        null,
        '나를 지지하는 사람들과 에너지를 소모시키는 관계의 차이를 살펴보세요.',
        '어울리기 위해 나를 줄이기보다 서로의 성장을 돕는 연결에 시간을 건네는 편이 좋아요.',
        '지금 더 가까이하고 싶은 사람이나 공동체는 어디인가요?'
      ),
      (
        'horoscope', 'twelve-houses', 'inner-world', 'context',
        '내면의 세계를 비추는 카드',
        null,
        '겉으로 설명하기 어려운 감정과 꿈이 어떤 이야기를 건네는지 조용히 들어보세요.',
        '혼자 있는 시간을 회피하지 않을 때 마음 깊은 곳에서 필요한 회복의 방향이 보여요.',
        '아무에게도 설명하지 않아도 되는 내 진짜 마음은 무엇일까요?'
      )
  ), reading_sources as (
    select
      reading.id,
      reading.topic_id,
      reading.orientation,
      position.role,
      position.headline,
      position.position_lead,
      position.position_summary,
      position.position_detail,
      position.reflection_question,
      profile.suit,
      case reading.orientation
        when 'upright' then base.upright
        else base.reversed
      end as active_meaning,
      case reading.orientation
        when 'upright' then profile.upright_one_line
        else profile.reversed_one_line
      end as fallback_line
    from tarot_position_readings as reading
    join position_definitions as position
      on position.reading_type = reading.reading_type
      and position.layout_id = reading.layout_id
      and position.position_id = reading.position_id
    join tarot_card_profiles as profile on profile.card_id = reading.card_id
    join tarot_base_interpretations as base on base.card_id = reading.card_id
  ), topic_sources as (
    select
      *,
      case topic_id
        when 'their-feelings' then active_meaning ->> 'love'
        when 'new-love' then active_meaning ->> 'love'
        when 'relationship-flow' then active_meaning ->> 'love'
        when 'career' then active_meaning ->> 'career'
        when 'money' then active_meaning ->> 'cause'
        when 'relationships' then active_meaning ->> 'relationships'
        when 'decision' then active_meaning ->> 'cause'
        when 'personal-flow' then active_meaning ->> 'overview'
      end as raw_topic_meaning,
      case topic_id
        when 'their-feelings' then active_meaning ->> 'emotion'
        when 'new-love' then active_meaning ->> 'current_situation'
        when 'relationship-flow' then active_meaning ->> 'relationships'
        when 'career' then active_meaning ->> 'current_situation'
        when 'money' then active_meaning ->> 'current_situation'
        when 'relationships' then active_meaning ->> 'emotion'
        when 'decision' then active_meaning ->> 'current_situation'
        when 'personal-flow' then active_meaning ->> 'emotion'
      end as raw_topic_detail,
      case
        when topic_id = 'career' then case suit
          when 'wands' then '프로젝트를 시작하거나 주도권을 잡는 장면에서 카드의 흐름이 특히 선명해져요.'
          when 'cups' then '동료와 협업하고 팀 안의 신뢰를 조율하는 장면에서 카드의 흐름이 특히 선명해져요.'
          when 'swords' then '평가와 면접, 시험이나 갈등을 다루는 장면에서 카드의 흐름이 특히 선명해져요.'
          when 'pentacles' then '기술과 결과, 급여나 성적을 점검하는 장면에서 카드의 흐름이 특히 선명해져요.'
          else '맡은 역할을 바꾸거나 일의 방향을 다시 정하는 장면에서 카드의 흐름이 특히 선명해져요.'
        end
        else null
      end as career_scene,
      case topic_id
        when 'their-feelings' then '말보다 연락의 간격과 행동의 일관성이 상대의 마음을 읽는 현실적인 단서가 돼요.'
        when 'new-love' then '첫인상의 설렘과 함께 대화 뒤에도 편안함이 남는지 살피는 일이 중요해요.'
        when 'relationship-flow' then '한 번의 장면보다 두 사람 사이에서 반복되는 역할과 거리의 변화가 더 깊은 단서가 돼요.'
        when 'career' then null
        when 'money' then '마음을 달래기 위한 소비와 실제로 필요한 지출을 나누어 보면 금전 흐름이 또렷해져요.'
        when 'relationships' then '상대의 반응을 책임지려 하기보다 서로 지킬 수 있는 거리와 표현을 확인해보세요.'
        when 'decision' then '선택의 이득과 비용, 되돌릴 수 있는 범위를 함께 적어보면 판단의 중심이 잡혀요.'
        when 'personal-flow' then '외부의 속도보다 지금의 에너지와 회복에 필요한 시간을 인정하는 것이 먼저예요.'
      end as topic_scene,
      case topic_id
        when 'their-feelings' then '상대의 마음은 말보다 일관된 행동에서 더 분명하게 드러나는 주제예요.'
        when 'new-love' then '새로운 인연은 설렘과 안전함이 함께 자랄 때 오래 이어질 수 있어요.'
        when 'relationship-flow' then '관계의 흐름은 두 사람이 반복해서 만드는 거리와 약속에서 모습을 드러내요.'
        when 'career' then '일과 진로의 흐름은 맡은 역할과 실제 결과, 평가 기준을 함께 볼 때 또렷해져요.'
        when 'money' then '금전의 흐름은 감정적인 기대보다 실제 금액과 기한을 확인할 때 차분히 읽을 수 있어요.'
        when 'relationships' then '사람 사이의 흐름은 서로의 경계와 주고받는 책임이 존중되는지 살필 때 선명해져요.'
        when 'decision' then '선택의 흐름은 얻는 것과 치르는 비용, 되돌릴 수 있는 범위를 함께 볼 때 드러나요.'
        when 'personal-flow' then '개인의 흐름은 바깥의 속도보다 지금 마음과 몸에 남은 에너지를 먼저 살필 때 보여요.'
      end as topic_fallback_meaning,
      case topic_id
        when 'their-feelings' then '상대의 말만 믿고 마음을 단정하거나 일관되지 않은 반응을 대신 해석해주는 일은 잠시 멈추는 편이 좋아요.'
        when 'new-love' then '첫인상의 설렘만으로 관계의 속도를 앞당기거나 불편한 경계를 넘는 선택은 피해주세요.'
        when 'relationship-flow' then '한쪽만 참고 맞추거나 반복되는 불편함을 애정으로 덮은 채 관계를 밀어붙이지 마세요.'
        when 'career' then '역할과 마감, 평가 기준이 흐린데도 책임을 더 떠안거나 결과 없이 밀어붙이는 선택은 피해야 해요.'
        when 'money' then '금액과 손실 범위를 확인하지 않은 채 불안이나 기대만으로 돈을 움직이는 선택은 멈춰주세요.'
        when 'relationships' then '내 한계를 넘기면서 모두를 만족시키거나 반복되는 무례를 대수롭지 않게 넘기지 마세요.'
        when 'decision' then '비용과 되돌릴 수 있는 범위를 모른 채 한쪽 장점만 보고 선택을 확정하지 마세요.'
        when 'personal-flow' then '지친 상태를 무시한 채 성과를 증명하려 하거나 삶 전체를 한 번에 바꾸려는 선택은 피해주세요.'
      end as blocker_condition,
      case topic_id
        when 'their-feelings' then '연락의 속도와 태도가 며칠 동안 같은 방향을 보이는지 확인하기 전에는 결론을 미뤄두세요.'
        when 'new-love' then '대화 뒤에 편안함이 남는지, 서로의 속도와 기대가 맞는지 몇 번 더 만나 확인해보세요.'
        when 'relationship-flow' then '서로 지킬 수 있는 약속과 책임을 같은 말로 이해하는지 대화와 행동을 통해 확인해보세요.'
        when 'career' then '업무 범위와 일정, 보상이나 평가 기준이 문서와 실제 대화에서 일치하는지 먼저 확인해보세요.'
        when 'money' then '필요한 금액과 기한, 최악의 손실을 숫자로 적고 감당 가능한 범위인지 검증해보세요.'
        when 'relationships' then '경계를 표현했을 때 상대가 존중하는지, 관계의 부담이 실제로 나뉘는지 더 지켜보세요.'
        when 'decision' then '각 선택을 작은 규모로 시험했을 때 생기는 실제 반응과 비용을 확인한 뒤 결정해도 늦지 않아요.'
        when 'personal-flow' then '휴식과 작은 루틴을 지켰을 때 에너지가 실제로 돌아오는지 살핀 뒤 다음 계획을 정하세요.'
      end as hold_condition,
      case topic_id
        when 'their-feelings' then '솔직한 질문 뒤에도 상대의 행동이 꾸준히 이어진다면 관계를 한 걸음 더 열어도 좋아요.'
        when 'new-love' then '호기심과 안전함이 함께 느껴지고 서로의 속도를 존중한다면 새로운 만남을 이어가도 좋아요.'
        when 'relationship-flow' then '두 사람이 책임을 나누고 지킬 수 있는 약속 하나가 확인된다면 관계를 앞으로 움직여도 좋아요.'
        when 'career' then '담당 역할과 평가 기준이 분명하고 작은 결과를 보여줄 준비가 됐다면 다음 기회로 움직여도 좋아요.'
        when 'money' then '금액과 기한이 분명하고 손실을 감당할 계획까지 세웠다면 작은 규모부터 진행해도 좋아요.'
        when 'relationships' then '내 경계가 존중되고 서로 주고받는 균형이 실제 행동으로 보인다면 마음을 더 열어도 좋아요.'
        when 'decision' then '핵심 기준을 만족하고 되돌릴 수 있는 첫 단계가 준비됐다면 그 선택을 시험해봐도 좋아요.'
        when 'personal-flow' then '몸과 마음의 에너지가 돌아오고 오래 지킬 수 있는 리듬이 잡혔다면 다음 변화를 시작해도 좋아요.'
      end as opening_condition
    from reading_sources
  ), prepared_sources as (
    select
      *,
      coalesce(
        nullif(btrim(raw_topic_meaning), ''),
        concat_ws(
          ' ',
          nullif(btrim(fallback_line), ''),
          topic_fallback_meaning
        )
      ) as topic_meaning,
      nullif(btrim(raw_topic_detail), '') as topic_detail,
      nullif(btrim(active_meaning ->> 'advice'), '') as base_advice
    from topic_sources
  )
  update tarot_position_readings as reading
  set
    headline = source.headline,
    summary = case source.role
      when 'past' then concat_ws(
        ' ',
        source.position_lead,
        nullif(source.topic_meaning, ''),
        source.position_summary
      )
      when 'present' then concat_ws(
        ' ',
        source.position_lead,
        nullif(source.topic_meaning, ''),
        source.position_summary
      )
      when 'future' then concat_ws(
        ' ',
        source.position_lead,
        nullif(source.topic_meaning, ''),
        source.position_summary
      )
      when 'blocker' then concat_ws(
        ' ',
        nullif(source.topic_meaning, ''),
        source.blocker_condition,
        source.position_summary
      )
      when 'hold' then concat_ws(
        ' ',
        nullif(source.topic_meaning, ''),
        source.hold_condition,
        source.position_summary
      )
      when 'opening' then concat_ws(
        ' ',
        nullif(source.topic_meaning, ''),
        source.opening_condition,
        source.position_summary
      )
      else concat_ws(
        ' ',
        nullif(source.topic_meaning, ''),
        source.position_summary
      )
    end,
    detail = concat_ws(
      ' ',
      nullif(source.topic_detail, source.topic_meaning),
      source.career_scene,
      source.topic_scene,
      source.position_detail
    ),
    advice = concat_ws(
      ' ',
      source.base_advice,
      case source.topic_id
        when 'their-feelings' then '상대의 마음을 단정하기 전에 솔직한 질문 한 번과 그 뒤의 행동을 함께 보세요.'
        when 'new-love' then '좋아 보이는 조건보다 대화 뒤에도 편안함이 남는 사람에게 천천히 시간을 주세요.'
        when 'relationship-flow' then '관계를 정의하려 서두르기보다 두 사람이 실제로 지킬 수 있는 약속 하나부터 정하세요.'
        when 'career' then '오늘 통제할 수 있는 일 하나를 정하고 평가할 수 있을 만큼 분명한 결과로 마무리해보세요.'
        when 'money' then '결정 전에 금액과 기한, 감당할 수 있는 손실을 적고 그 범위 안에서만 움직이세요.'
        when 'relationships' then '모두를 만족시키려 하지 말고 오래 지킬 수 있는 거리와 표현 방식을 선택하세요.'
        when 'decision' then '각 선택의 이득과 비용을 적은 뒤 되돌릴 수 있는 작은 단계부터 시험해보세요.'
        when 'personal-flow' then '삶 전체를 한 번에 바꾸지 말고 가장 먼저 에너지를 되찾고 싶은 영역부터 돌보세요.'
      end
    ),
    reflection_question = source.reflection_question
  from prepared_sources as source
  where reading.id = source.id;

  get diagnostics updated_row_count = row_count;

  if updated_row_count <> 47424 then
    raise exception 'Expected to refine 47424 position readings';
  end if;

  if (select count(*) from tarot_position_readings) <> 47424 then
    raise exception 'Expected 47424 position readings after refinement';
  end if;
end
$$;
