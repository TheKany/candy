"use client";

import Wrapper from "../_common/_Wrapper";
import { useUserPickNum } from "@/store/useUserPickNumStore";
import Image from "next/image";
import styled from "styled-components";
import { useEffect, useState } from "react";
import { getTarotTopic } from "@/constants/tarotTopics";
import { useTarotTopicStore } from "@/store/useTarotTopicStore";

type CardProps = {
  id: number;
  name: string;
  nickname: string;
  coreKeyword: string[];
  type: string;
};

type OneCardReadingProps = {
  card_id: number;
  title: null;
  reading_text: string;
};

type CombinedCardProps = CardProps & {
  readingText: string;
};

const OneCardResult = () => {
  const pickCards = useUserPickNum((state) => state.realCard);
  const topicId = useTarotTopicStore((state) => state.topic);
  const topic = getTarotTopic(topicId);

  const [data, setData] = useState<CombinedCardProps[]>([]);

  const onLoadData = async () => {
    try {
      const idString = pickCards.join(",");
      const [cardDataResponse, oneCardReadingResponse] = await Promise.all([
        fetch(`/api/cardData?ids=${idString}`),
        fetch(`/api/oneCardReading?ids=${idString}`),
      ]);

      if (!cardDataResponse.ok || !oneCardReadingResponse.ok) {
        throw new Error("데이터를 불러오는 데 실패했습니다.");
      }

      const cardData: CardProps[] = await cardDataResponse.json();
      const oneCardReadings: OneCardReadingProps[] =
        await oneCardReadingResponse.json();

      const combinedData = cardData.map((card) => {
        const reading = oneCardReadings.find((r) => r.card_id === card.id);
        return {
          ...card,
          readingText: reading?.reading_text || "해석을 찾을 수 없습니다.",
        };
      });

      setData(combinedData);
    } catch (error) {
      console.error("카드 데이터를 불러오는 중 오류 발생:", error);
    }
  };

  useEffect(() => {
    if (pickCards.length > 0) {
      onLoadData();
    }
  }, [pickCards]);

  return (
    <Wrapper>
      {topic && <TopicLabel>선택한 주제 · {topic.title}</TopicLabel>}
      <Box $count={pickCards.length}>
        {data.map((card) => (
          <CardInfo key={card.id}>
            <CardBox>
              <p>{card.name}</p>
              <p>( {card.nickname} )</p>
              <p>{card.coreKeyword.join(", ")}</p>

              <Image
                src={`/cards/card${Number(card.id)}.webp`}
                alt="뽑은 카드"
                width={pickCards.length === 1 ? 240 : 120}
                height={pickCards.length === 1 ? 400 : 200}
              />
            </CardBox>
            <TextBox>{card.readingText}</TextBox>
          </CardInfo>
        ))}
      </Box>
    </Wrapper>
  );
};

export default OneCardResult;

const TopicLabel = styled.p`
  width: fit-content;
  margin: 0 auto 18px;
  padding: 7px 13px;
  border: 1px solid #d8b85c;
  border-radius: 999px;
  color: #294d40;
  background: #fff9e8;
  font-size: 0.84rem;
  font-weight: 700;
  text-align: center;
`;

const Box = styled.div<{ $count: number }>`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${({ $count }) => ($count > 1 ? "16px" : "0")};
  width: 100%;

  & img {
    object-fit: contain;
    ${({ $count }) =>
      $count === 1 &&
      `
      max-width: 80%;
      height: auto;
    `}
    ${({ $count }) =>
      $count > 1 &&
      `
      flex: 1;
      max-width: 33%;
      height: auto;
    `}
  }
`;

const CardInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const CardBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 30px 20px;
  background-color: #f7f3e8;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  p {
    color: #3b5249;
    margin: 0 0 8px;
    font-family: "Georgia", serif;
  }

  /* 카드 이름 스타일 */
  p:first-of-type {
    position: relative;
    font-size: 2.2rem;
    font-weight: bold;
    margin-bottom: 4px;
  }

  /* 카드 별명 스타일 */
  p:nth-of-type(2) {
    font-size: 0.9rem;
    font-weight: 300;
    font-style: italic;
    color: #6c7a6e;
    margin-bottom: 12px;
  }

  /* 핵심 키워드 스타일 */
  p:nth-of-type(3) {
    font-size: 1rem;
    color: #8c9c8e;
    line-height: 1.4;
  }
`;

const TextBox = styled.div`
  font-size: 1rem;
  line-height: 1.6;
  max-width: 500px;
  text-align: justify;
  margin-top: 30px;
  padding: 30px 20px;
  background-color: #3b5249;
  color: #f7f3e8;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  white-space: pre-wrap;
`;
