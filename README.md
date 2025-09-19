# 타로카드 서비스

https://tarot-tart.vercel.app/

## 만들게 된 계기

한 때 타로카드에 관심이 생겨 책과 카드를 구입해 주변 지인들의 타로를 봐주곤 했습니다.
이 경험을 바탕으로 복잡한 해석본 / 장소 / 전문성에 구애받지 않는 앱 서비스로 만들면 좋겠다라는 생각에
무료버전으로 라이트하게 제작을 했습니다 :)

## 사용 스택

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Styled Components](https://img.shields.io/badge/styled--components-DB7093?style=flat&logo=styled-components&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![Amazon S3](https://img.shields.io/badge/Amazon%20S3-569A31?style=flat&logo=amazonaws&logoColor=white)

## 프로젝트 구성 인원

- 기획 / 디자인 / 개발: 👨🏻‍🦱 kkan (1인)

## 주요 기능

- 생각 -> 키워드 선택 -> 결과 의 형태
- 사용자는 본인이 가지고 있는 고민에 대해 생각하면서 키워드를 고르고, 결과 해석본을 받는다.
- 카카오톡 공유
- 개발자에게 피드백 보내기

## 기술 구현

- 인공지능을 활용한 해석이 아닌 타로에 관련된 다양한 해석을 종합하여 압축된 형태로 제공.
- 카드를 섞는 기능은 단순하게 '피셔 예이츠 셔플'을 사용하는게 아닌 사람이 섞을 때 발생하는 경우의 수를 생각하여 로직 작성.
- supabase를 활용한 누적 이용자 / 개발자 피드백 전송 / 타로 해석 데이터 저장.
- pwa 를 활용해 웹앱 형태로 제공.

## TODO

- 웹 형태의 최적화된 view 제공
- 다양한 형태의 타로기능 추가
- 다양한 각도의 해석 추가
- PWA 기능 추가

### 2025.09.18
- 좀 더 자세한 리딩을 위해 질문지 개편

