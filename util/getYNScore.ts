import {
  CategoryKeyword,
  CategoryList,
  TarotCardsData,
} from "@/types/tarotCardTypes";

// Yes or No 일 경우 카드별 점수 가중치 테이블
// 카드 위치
// [1] [2]
//   [3]
// [1]	마이너 아르카나	1.0
// [1]	메이저 아르카나	1.5
// [2]	마이너 아르카나	1.0
// [2]	메이저 아르카나	1.5
// [3]	마이너 아르카나	2.25
// [3]	메이저 아르카나	1.25

type Props = {
  cardData: TarotCardsData[];
  category: CategoryKeyword;
};

/**
 * @param cardData: TarotCardsData[]
 * @returns score[]
 */
export const getYNScore = ({ cardData, category }: Props) => {
  const firstCard = cardData[0];
  const secondCard = cardData[1];
  const thirdCard = cardData[2];

  const firstScore =
    firstCard.score[category] * (firstCard.type === "major" ? 1.5 : 1.0);
  const secondScore =
    secondCard.score[category] * (secondCard.type === "major" ? 1.5 : 1.0);
  const thirdScore =
    thirdCard.score[category] * (thirdCard.type === "major" ? 1.25 : 2.25);

  return [firstScore, secondScore, thirdScore];
};
