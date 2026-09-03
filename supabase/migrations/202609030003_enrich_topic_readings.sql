alter table tarot_topic_readings
add column if not exists conclusion text;

with reading_sources as (
  select
    reading.id,
    reading.topic_id,
    reading.orientation,
    case
      when reading.orientation = 'upright' then base.upright
      else base.reversed
    end as active_meaning,
    case
      when reading.orientation = 'upright' then base.reversed
      else base.upright
    end as shadow_meaning,
    case
      when reading.orientation = 'upright' then profile.upright_keywords
      else profile.reversed_keywords
    end as keywords
  from tarot_topic_readings as reading
  join tarot_card_profiles as profile on profile.card_id = reading.card_id
  join tarot_base_interpretations as base on base.card_id = reading.card_id
), prepared_sources as (
  select
    *,
    coalesce(keywords[1], '핵심') as primary_keyword,
    coalesce(keywords[2], keywords[1], '변화') as secondary_keyword
  from reading_sources
)
update tarot_topic_readings as reading
set
  conclusion = case source.topic_id
    when 'their-feelings' then case source.orientation
      when 'upright' then format(
        '상대의 마음에서는 “%s” 기운이 가장 크게 드러납니다. 말보다 “%s”가 실제 행동으로 이어지는지 보세요.',
        source.primary_keyword, source.secondary_keyword
      )
      else format(
        '상대의 마음에는 “%s” 문제가 먼저 걸려 있습니다. “%s”에 대한 확신보다 행동의 일관성을 확인하세요.',
        source.primary_keyword, source.secondary_keyword
      )
    end
    when 'new-love' then case source.orientation
      when 'upright' then format(
        '새로운 인연에서는 “%s” 가능성이 열립니다. 두 번째 단서인 “%s”의 속도를 서두르지 않는 것이 결론이에요.',
        source.primary_keyword, source.secondary_keyword
      )
      else format(
        '새로운 만남보다 먼저 “%s” 문제를 정리할 때입니다. “%s”가 반복되지 않는지 확인하세요.',
        source.primary_keyword, source.secondary_keyword
      )
    end
    when 'relationship-flow' then case source.orientation
      when 'upright' then format(
        '이 관계의 핵심은 “%s”입니다. 함께 나타난 “%s”의 균형이 다음 흐름을 결정해요.',
        source.primary_keyword, source.secondary_keyword
      )
      else format(
        '이 관계는 “%s”에서 막혀 있습니다. 함께 나타난 “%s”의 문제를 피하지 않아야 흐름이 다시 움직여요.',
        source.primary_keyword, source.secondary_keyword
      )
    end
    when 'career' then case source.orientation
      when 'upright' then format(
        '일에서는 “%s”에 힘을 실을 때입니다. 함께 나타난 “%s”의 기운을 구체적인 결과로 옮기세요.',
        source.primary_keyword, source.secondary_keyword
      )
      else format(
        '지금 일의 걸림돌은 “%s”입니다. 함께 나타난 “%s”의 상태를 점검한 뒤 속도보다 방향부터 바로잡으세요.',
        source.primary_keyword, source.secondary_keyword
      )
    end
    when 'money' then case source.orientation
      when 'upright' then format(
        '금전 흐름의 핵심은 “%s”입니다. 함께 나타난 “%s”의 가능성을 숫자와 계획으로 확인한 뒤 움직이세요.',
        source.primary_keyword, source.secondary_keyword
      )
      else format(
        '돈 문제에서는 “%s”를 경계해야 합니다. “%s”에 끌린 결정보다 손실을 줄이는 선택이 먼저예요.',
        source.primary_keyword, source.secondary_keyword
      )
    end
    when 'relationships' then case source.orientation
      when 'upright' then format(
        '사람 사이에서는 “%s”가 답입니다. 함께 나타난 “%s”의 가치를 지키면서 관계의 거리를 조절하세요.',
        source.primary_keyword, source.secondary_keyword
      )
      else format(
        '지금 관계의 피로는 “%s”에서 시작됩니다. “%s”를 무시하지 말고 경계를 다시 세우세요.',
        source.primary_keyword, source.secondary_keyword
      )
    end
    when 'decision' then case source.orientation
      when 'upright' then format(
        '이번 선택에서는 “%s”를 기준으로 삼으세요. 함께 나타난 “%s”의 부담을 감당할 수 있다면 움직여도 좋습니다.',
        source.primary_keyword, source.secondary_keyword
      )
      else format(
        '지금은 “%s” 때문에 판단이 흐려질 수 있습니다. “%s”를 확인할 때까지 되돌릴 수 있는 선택만 하세요.',
        source.primary_keyword, source.secondary_keyword
      )
    end
    when 'personal-flow' then case source.orientation
      when 'upright' then format(
        '지금 나의 흐름은 “%s” 쪽으로 움직입니다. 함께 나타난 “%s”라는 방향을 일상에서 작게 실천할 때예요.',
        source.primary_keyword, source.secondary_keyword
      )
      else format(
        '지금은 앞으로 나아가기보다 “%s”를 돌볼 때입니다. 함께 나타난 “%s” 관련 신호를 먼저 정리하세요.',
        source.primary_keyword, source.secondary_keyword
      )
    end
  end,
  hidden_context = concat_ws(' ',
    case source.topic_id
      when 'their-feelings' then source.active_meaning ->> 'love'
      when 'new-love' then source.active_meaning ->> 'love'
      when 'relationship-flow' then source.active_meaning ->> 'love'
      when 'career' then source.active_meaning ->> 'career'
      when 'money' then source.active_meaning ->> 'cause'
      when 'relationships' then source.active_meaning ->> 'relationships'
      when 'decision' then source.active_meaning ->> 'cause'
      when 'personal-flow' then source.active_meaning ->> 'overview'
    end,
    case source.topic_id
      when 'their-feelings' then '겉으로 드러난 말보다 반응의 속도와 일관성이 이 마음의 진짜 배경을 보여줍니다.'
      when 'new-love' then '새 사람을 받아들이는 방식에는 과거의 기대와 경계가 함께 섞여 있을 수 있습니다.'
      when 'relationship-flow' then '지금의 장면 하나보다 두 사람 사이에서 반복된 역할과 거리 조절이 더 중요한 단서입니다.'
      when 'career' then '현재의 업무 문제 뒤에는 인정받고 싶은 마음과 책임 범위를 넓히려는 욕구가 함께 작동할 수 있습니다.'
      when 'money' then '금액 자체보다 불안을 달래거나 확신을 얻기 위해 돈을 움직이려는 마음이 숨어 있는지 살펴보세요.'
      when 'relationships' then '상대의 반응을 책임지려 했던 습관이나 거절을 피하려는 마음이 관계의 균형에 영향을 주고 있습니다.'
      when 'decision' then '결정을 미루는 이유가 정보 부족인지 결과를 책임지는 두려움인지 구분해야 진짜 변수가 보입니다.'
      when 'personal-flow' then '외부 평가에 맞추느라 미뤄둔 필요와 반복되는 감정이 현재 흐름의 배경을 설명합니다.'
    end
  ),
  challenge = concat_ws(' ',
    source.shadow_meaning ->> 'current_situation',
    case source.topic_id
      when 'their-feelings' then format('핵심 단어는 “%s”입니다. 이 기대만으로 상대가 말하지 않은 빈칸을 대신 채우지 않는 것이 과제입니다.', source.primary_keyword)
      when 'new-love' then format('핵심 단어는 “%s”입니다. 첫인상에 끌려 관계의 속도를 앞당기기보다 안전함과 호기심이 함께 있는지 확인해야 합니다.', source.primary_keyword)
      when 'relationship-flow' then format('핵심 단어는 “%s”입니다. 이를 지키려다 한쪽만 참고 있지 않은지 살피고, 서로의 책임을 분명히 나누어야 합니다.', source.primary_keyword)
      when 'career' then format('핵심 단어는 “%s”입니다. 이 에너지가 과로 또는 독단으로 바뀌지 않도록 우선순위와 협업 범위를 조율해야 합니다.', source.primary_keyword)
      when 'money' then format('핵심 단어는 “%s”입니다. 기대가 실제 수입과 지출의 숫자를 가리지 않도록 충동과 계획을 분리해야 합니다.', source.primary_keyword)
      when 'relationships' then format('핵심 단어는 “%s”입니다. 이를 위해 내 한계를 넘기지 말고, 불편함을 관계가 무너진다는 신호로 단정하지 않는 것이 과제입니다.', source.primary_keyword)
      when 'decision' then format('핵심 단어는 “%s”입니다. 이 한 면만 보고 선택을 이상화하지 말고 비용과 되돌릴 수 있는 범위를 함께 봐야 합니다.', source.primary_keyword)
      when 'personal-flow' then format('핵심 단어는 “%s”입니다. 이를 빨리 증명하려 하지 말고 회복에 필요한 시간과 실제 에너지 수준을 인정해야 합니다.', source.primary_keyword)
    end
  ),
  opportunity = concat_ws(' ',
    source.active_meaning ->> 'current_situation',
    case source.topic_id
      when 'their-feelings' then format('기회를 여는 단어는 “%s”입니다. 이 단서를 솔직한 질문으로 바꾸면 추측하던 마음을 실제 대화에서 확인할 수 있습니다.', source.secondary_keyword)
      when 'new-love' then format('기회를 여는 단어는 “%s”입니다. 이 모습을 자연스럽게 보여줄 수 있는 자리와 대화를 선택하면 새로운 연결의 가능성이 커집니다.', source.secondary_keyword)
      when 'relationship-flow' then format('기회를 여는 단어는 “%s”입니다. 이를 함께 지킬 작은 약속으로 만들면 관계의 균형을 다시 세울 수 있습니다.', source.secondary_keyword)
      when 'career' then format('기회를 여는 단어는 “%s”입니다. 이를 작은 결과물로 증명하면 역할 확대나 새로운 제안을 받을 근거가 생깁니다.', source.secondary_keyword)
      when 'money' then format('기회를 여는 단어는 “%s”입니다. 이 가능성을 구체적인 금액과 기한으로 바꾸면 막연한 불안을 실행 가능한 계획으로 전환할 수 있습니다.', source.secondary_keyword)
      when 'relationships' then format('기회를 여는 단어는 “%s”입니다. 이 가치를 존중하는 방식으로 요청을 표현하면 관계를 끊지 않고도 건강한 거리를 만들 수 있습니다.', source.secondary_keyword)
      when 'decision' then format('기회를 여는 단어는 “%s”입니다. 이를 검증할 작은 실험부터 하면 큰 결정을 내리기 전에 실제 반응을 확인할 수 있습니다.', source.secondary_keyword)
      when 'personal-flow' then format('기회를 여는 단어는 “%s”입니다. 이 감각을 회복시키는 활동에 시간을 먼저 배정하면 삶의 다른 영역도 함께 움직일 여지가 생깁니다.', source.secondary_keyword)
    end
  ),
  near_future = concat_ws(' ',
    source.active_meaning ->> 'future',
    case source.topic_id
      when 'their-feelings' then '가까운 흐름에서는 상대의 설명보다 연락 방식과 행동의 변화가 먼저 답을 보여줄 가능성이 큽니다.'
      when 'new-love' then '새로운 만남은 갑작스러운 확신보다 반복해서 편안함을 느끼는 대화로 구체화될 가능성이 큽니다.'
      when 'relationship-flow' then '두 사람이 지킬 수 있는 약속 하나를 정하면 관계의 방향이 지금보다 분명해질 가능성이 큽니다.'
      when 'career' then '업무의 우선순위를 좁혀 결과를 보여주면 평가나 역할 변화가 뒤따를 가능성이 큽니다.'
      when 'money' then '지출과 기한을 정리한 뒤에는 유지할 것과 포기할 것이 선명해져 금전 흐름이 안정될 가능성이 큽니다.'
      when 'relationships' then '경계를 분명히 표현할수록 남을 관계와 거리를 둘 관계가 자연스럽게 구분될 가능성이 큽니다.'
      when 'decision' then '작은 검증을 거치면 막연했던 선택지가 현실적인 조건과 우선순위로 정리될 가능성이 큽니다.'
      when 'personal-flow' then '에너지를 되찾는 한 영역부터 돌보면 일상 전체의 속도와 방향이 차츰 조정될 가능성이 큽니다.'
    end
  ),
  advice = concat_ws(' ',
    source.active_meaning ->> 'advice',
    case source.topic_id
      when 'their-feelings' then '상대의 마음을 단정하기 전에 한 번의 솔직한 질문과 이후의 행동을 함께 보세요.'
      when 'new-love' then '좋아 보이는 조건보다 대화 뒤에도 편안함이 남는 사람에게 시간을 주세요.'
      when 'relationship-flow' then '관계를 정의하려 서두르기보다 서로 실제로 지킬 수 있는 약속 하나부터 정하세요.'
      when 'career' then '오늘 통제할 수 있는 업무 하나를 정하고 결과가 보이는 크기로 완성하세요.'
      when 'money' then '결정 전에 금액·기한·최악의 손실을 적고 감당 가능한 범위 안에서만 움직이세요.'
      when 'relationships' then '모두를 만족시키려 하지 말고 오래 유지할 수 있는 거리와 표현 방식을 선택하세요.'
      when 'decision' then '각 선택의 이득과 비용을 적은 뒤 되돌릴 수 있는 작은 단계부터 실행하세요.'
      when 'personal-flow' then '삶 전체를 한 번에 바꾸지 말고 가장 먼저 에너지를 되찾고 싶은 영역부터 돌보세요.'
    end
  )
from prepared_sources as source
where reading.id = source.id;

alter table tarot_topic_readings
alter column conclusion set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tarot_topic_readings_conclusion_not_blank'
  ) then
    alter table tarot_topic_readings
    add constraint tarot_topic_readings_conclusion_not_blank
    check (length(trim(conclusion)) > 0);
  end if;
end
$$;
