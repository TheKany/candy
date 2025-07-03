"use client";

import Container from "@/components/_common/_Container";
import { usePickCard } from "@/store/pickCardStore";
import { useShuffleType } from "@/store/shuffleTypeStore";
import { useTarotType } from "@/store/tarotTypeStore";
import {
  CategoryKeyword,
  CategoryList,
  TarotCardsData,
} from "@/types/tarotCardTypes";
import { getCardPick } from "@/util/getCardData";
import { getRandomCardNo } from "@/util/getRandomCardNo";
import { getYNScore } from "@/util/getYNScore";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import OneCard from "./_component/OneCard";
import ThreeCard from "./_component/ThreeCard";
import YesOrNoCard from "./_component/YesOrNoCard";

const Result = () => {
  const { pickWay } = usePickCard();
  const { type } = useTarotType();
  const { resetShuffleStep } = useShuffleType();

  const [cardList, setCardList] = useState<TarotCardsData[] | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [pickCategory, setPickCategory] = useState<CategoryKeyword | null>(
    null
  );
  const [scoreArr, setScoreArr] = useState<number[]>([]);

  const pickCardNo = getRandomCardNo({ length: 78, pickWay, type });

  const onClickCategory = async (category: CategoryList) => {
    setIsVisible(false);
    setPickCategory(category.keyword);

    // 카드 뽑기
    const result = await getCardPick([...pickCardNo]);

    // 카드 데이터 (Yes or No 일 경우 점수계산)
    if (type === "Yn") {
      const resultScore = getYNScore({
        cardData: result,
        category: category.keyword,
      });

      setScoreArr(resultScore);
    }

    setCardList(result);
  };

  // 해당 페이지오면 셔플 스텝 초기화
  useEffect(() => {
    resetShuffleStep();
  }, []);

  return (
    <Container>
      <CategoryContainer $visible={isVisible}>
        <BtnTitle>고민의 키워드는 뭔가요?</BtnTitle>
        <ButtonContainer>
          <ButtonBox onClick={() => onClickCategory({ keyword: "career" })}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#121212"
            >
              <path d="M160-120q-33 0-56.5-23.5T80-200v-440q0-33 23.5-56.5T160-720h160v-80q0-33 23.5-56.5T400-880h160q33 0 56.5 23.5T640-800v80h160q33 0 56.5 23.5T880-640v440q0 33-23.5 56.5T800-120H160Zm240-600h160v-80H400v80Zm400 360H600v80H360v-80H160v160h640v-160Zm-360 0h80v-80h-80v80Zm-280-80h200v-80h240v80h200v-200H160v200Zm320 40Z" />
            </svg>
            직장/커리어
          </ButtonBox>
          <ButtonBox onClick={() => onClickCategory({ keyword: "finance" })}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#121212"
            >
              <path d="M600-320h120q17 0 28.5-11.5T760-360v-240q0-17-11.5-28.5T720-640H600q-17 0-28.5 11.5T560-600v240q0 17 11.5 28.5T600-320Zm40-80v-160h40v160h-40Zm-280 80h120q17 0 28.5-11.5T520-360v-240q0-17-11.5-28.5T480-640H360q-17 0-28.5 11.5T320-600v240q0 17 11.5 28.5T360-320Zm40-80v-160h40v160h-40Zm-200 80h80v-320h-80v320ZM80-160v-640h800v640H80Zm80-560v480-480Zm0 480h640v-480H160v480Z" />
            </svg>
            금전
          </ButtonBox>
          <ButtonBox onClick={() => onClickCategory({ keyword: "fortune" })}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#121212"
            >
              <path d="M440-760v-160h80v160h-80Zm266 110-55-55 112-115 56 57-113 113Zm54 210v-80h160v80H760ZM440-40v-160h80v160h-80ZM254-652 140-763l57-56 113 113-56 54Zm508 512L651-255l54-54 114 110-57 59ZM40-440v-80h160v80H40Zm157 300-56-57 112-112 29 27 29 28-114 114Zm283-100q-100 0-170-70t-70-170q0-100 70-170t170-70q100 0 170 70t70 170q0 100-70 170t-170 70Zm0-80q66 0 113-47t47-113q0-66-47-113t-113-47q-66 0-113 47t-47 113q0 66 47 113t113 47Zm0-160Z" />
            </svg>
            운세
          </ButtonBox>
          <ButtonBox onClick={() => onClickCategory({ keyword: "health" })}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#121212"
            >
              <path d="M320-120v-200H120v-320h200v-200h320v200h200v320H640v200H320Zm80-80h160v-200h200v-160H560v-200H400v200H200v160h200v200Zm80-280Z" />
            </svg>
            건강
          </ButtonBox>
          <ButtonBox onClick={() => onClickCategory({ keyword: "love" })}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#121212"
            >
              <path d="M718-313 604-426l57-56 57 56 141-141 57 56-198 198ZM440-501Zm0 381L313-234q-72-65-123.5-116t-85-96q-33.5-45-49-87T40-621q0-94 63-156.5T260-840q52 0 99 22t81 62q34-40 81-62t99-22q81 0 136 45.5T831-680h-85q-18-40-53-60t-73-20q-51 0-88 27.5T463-660h-46q-31-45-70.5-72.5T260-760q-57 0-98.5 39.5T120-621q0 33 14 67t50 78.5q36 44.5 98 104T440-228q26-23 61-53t56-50l9 9 19.5 19.5L605-283l9 9q-22 20-56 49.5T498-172l-58 52Z" />
            </svg>
            연애
          </ButtonBox>
          <ButtonBox onClick={() => onClickCategory({ keyword: "path" })}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#121212"
            >
              <path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780Zm-455-80h311q-10-20-55.5-35T480-370q-55 0-100.5 15T325-320ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Zm0-80q17 0 28.5-11.5T520-600q0-17-11.5-28.5T480-640q-17 0-28.5 11.5T440-600q0 17 11.5 28.5T480-560Zm1 240Zm-1-280Z" />
            </svg>
            인간관계
          </ButtonBox>
          <ButtonBox
            onClick={() => onClickCategory({ keyword: "relationship" })}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#121212"
            >
              <path d="M480-120 200-272v-240L40-600l440-240 440 240v320h-80v-276l-80 44v240L480-120Zm0-332 274-148-274-148-274 148 274 148Zm0 241 200-108v-151L480-360 280-470v151l200 108Zm0-241Zm0 90Zm0 0Z" />
            </svg>
            진로/학업
          </ButtonBox>
          <ButtonBox onClick={() => onClickCategory({ keyword: "self" })}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#121212"
            >
              <path d="M390-120q-51 0-88-35.5T260-241q-60-8-100-53t-40-106q0-21 5.5-41.5T142-480q-11-18-16.5-38t-5.5-42q0-61 40-105.5t99-52.5q3-51 41-86.5t90-35.5q26 0 48.5 10t41.5 27q18-17 41-27t49-10q52 0 89.5 35t40.5 86q59 8 99.5 53T840-560q0 22-5.5 42T818-480q11 18 16.5 38.5T840-400q0 62-40.5 106.5T699-241q-5 50-41.5 85.5T570-120q-25 0-48.5-9.5T480-156q-19 17-42 26.5t-48 9.5Zm130-590v460q0 21 14.5 35.5T570-200q20 0 34.5-16t15.5-36q-21-8-38.5-21.5T550-306q-10-14-7.5-30t16.5-26q14-10 30-7.5t26 16.5q11 16 28 24.5t37 8.5q33 0 56.5-23.5T760-400q0-5-.5-10t-2.5-10q-17 10-36.5 15t-40.5 5q-17 0-28.5-11.5T640-440q0-17 11.5-28.5T680-480q33 0 56.5-23.5T760-560q0-33-23.5-56T680-640q-11 18-28.5 31.5T613-587q-16 6-31-1t-20-23q-5-16 1.5-31t22.5-20q15-5 24.5-18t9.5-30q0-21-14.5-35.5T570-760q-21 0-35.5 14.5T520-710Zm-80 460v-460q0-21-14.5-35.5T390-760q-21 0-35.5 14.5T340-710q0 16 9 29.5t24 18.5q16 5 23 20t2 31q-6 16-21 23t-31 1q-21-8-38.5-21.5T279-640q-32 1-55.5 24.5T200-560q0 33 23.5 56.5T280-480q17 0 28.5 11.5T320-440q0 17-11.5 28.5T280-400q-21 0-40.5-5T203-420q-2 5-2.5 10t-.5 10q0 33 23.5 56.5T280-320q20 0 37-8.5t28-24.5q10-14 26-16.5t30 7.5q14 10 16.5 26t-7.5 30q-14 19-32 33t-39 22q1 20 16 35.5t35 15.5q21 0 35.5-14.5T440-250Zm40-230Z" />
            </svg>
            내면
          </ButtonBox>
        </ButtonContainer>
      </CategoryContainer>

      {cardList ? (
        <>
          <CardListContainer>
            {/* type: one */}
            {type === "one" ? (
              <OneCard cardList={cardList} pickCategory={pickCategory} />
            ) : null}
            {/* type: three */}
            {type === "three" ? (
              <ThreeCard cardList={cardList} pickCategory={pickCategory} />
            ) : null}
            {/* type: Yn */}
            {type === "Yn" ? (
              <YesOrNoCard
                cardList={cardList}
                pickCategory={pickCategory}
                scoreArr={scoreArr}
              />
            ) : null}
          </CardListContainer>
        </>
      ) : null}
    </Container>
  );
};

export default Result;

const BtnTitle = styled.p`
  font-family: "BlackHanSans";
  color: aliceblue;
  text-align: center;
  font-size: 24px;
  padding-bottom: 8px;
`;

const CategoryContainer = styled.div<{ $visible: boolean }>`
  display: ${(props) => (props.$visible ? "block" : "none")};
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transition: opacity 0.4s ease-in-out;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const ButtonBox = styled.button`
  font-size: 14px;
  padding: 8px;
  border-radius: 8px;
  background-color: #fff;

  display: flex;
  align-items: center;
  gap: 4px;
`;

const CardListContainer = styled.div`
  width: 100%;
  height: 80vh;

  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 16px;

  overflow-y: auto;
`;

const CardWrapper = styled.div`
  width: 100%;

  display: flex;
`;

const InfoBox = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
`;

const KeywordBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 16px 0;

  & span {
    background-color: #fff;
    padding: 8px 4px;
    border-radius: 4px;
    text-align: center;
    font-weight: 500;
  }
`;

const CardImgBox = styled.div`
  position: relative;

  width: 50%;
  aspect-ratio: 2 / 3;
`;
