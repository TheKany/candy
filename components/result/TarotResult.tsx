"use client";

import { usePickCard } from "@/store/pickCardStore";
import { useTarotType } from "@/store/tarotTypeStore";
import { CategoryKeyword } from "@/types/tarotCardTypes";
import {
  handleCardBasicInfo,
  handleCardEmoData,
  handleCardFlowData,
  handleCardWorryData,
} from "@/util/handleCardData";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

type CardBasicData = {
  name: string;
  nickname: string;
  coreKeyword: string[];
};

type CardComment = {
  cardNo: number;
  cardBasicData: CardBasicData | null;
  worry: string[];
  emotion: string[];
  flow: string[];
};

const TarotResult = () => {
  const { pickedWorry, pickedEmotion, pickedFlow, pickedCardList } =
    usePickCard();
  const { type } = useTarotType();

  const [comments, setComments] = useState<CardComment[]>([]);

  const onLoadData = async () => {
    const results: CardComment[] = new Array(pickedCardList.length);

    await Promise.all(
      pickedCardList.map(async (cardNo, i) => {
        const [cardBasicData, worryData, emoData, flowData] = await Promise.all(
          [
            handleCardBasicInfo({
              id: cardNo,
            }),
            handleCardWorryData({
              id: cardNo,
              keyword: pickedWorry as CategoryKeyword,
            }),
            handleCardEmoData({
              id: cardNo,
              keyword: pickedEmotion as CategoryKeyword,
            }),
            handleCardFlowData({
              id: cardNo,
              keyword: pickedFlow as CategoryKeyword,
            }),
          ]
        );

        results[i] = {
          cardNo,
          cardBasicData: cardBasicData[0]
            ? {
                name: cardBasicData[0].name,
                nickname: cardBasicData[0].nickname,
                coreKeyword: cardBasicData[0].coreKeyword,
              }
            : null,
          worry: worryData
            ? [worryData[0]?.solution ?? "", worryData[1]?.solution ?? ""]
            : [],
          emotion: emoData
            ? [emoData[0]?.solution ?? "", emoData[1]?.solution ?? ""]
            : [],
          flow: flowData
            ? [flowData[0]?.solution ?? "", flowData[1]?.solution ?? ""]
            : [],
        };
      })
    );

    setComments(results);
  };

  useEffect(() => {
    onLoadData();
  }, []);

  return (
    <>
      {comments.map(({ cardNo, cardBasicData, worry, emotion, flow }, idx) => (
        <ResultContainer key={cardNo}>
          {type === "three" ? (
            <Title>
              {idx === 0
                ? "🌿 지나온 시간 속 당신 [과거]"
                : idx === 1
                ? "🌱 지금 당신의 마음 [현재]"
                : "🌈 다가올 변화의 흐름 [가까운 미래]"}
            </Title>
          ) : null}
          <CardInfoBox>
            <p>
              이 카드는 [{cardBasicData?.name}] 카드로 <br />
              <strong>{cardBasicData?.nickname}</strong>이라는 주제를 담고
              있어요.🤓
            </p>
            <p>이 카드는</p>
            <KeywordBox>
              {cardBasicData?.coreKeyword.map((word, idx) => {
                return <span key={idx}>{word}</span>;
              })}
            </KeywordBox>
            <p>라는 의미를 당신에게 전해주고 있어요.</p>
          </CardInfoBox>
          <ImgBox>
            <Image
              src={`/cards/card${cardNo}.webp`}
              alt={``}
              width={0}
              height={0}
              unoptimized
              fill
            />
          </ImgBox>

          <TextBox>
            {worry.map((text, i) => (
              <span key={`worry-${i}`}>{text}</span>
            ))}

            {emotion.map((text, i) => (
              <span key={`emotion-${i}`}>{text}</span>
            ))}

            {flow.map((text, i) => (
              <span key={`flow-${i}`}>{text}</span>
            ))}
          </TextBox>
        </ResultContainer>
      ))}
    </>
  );
};

export default TarotResult;

const Title = styled.p`
  display: flex;
  justify-content: center;
  align-items: center;

  padding: 4px;
  margin: 8px 0;
  width: 100%;
  background-color: #d4af37;
  font-weight: 500;
`;

const CardInfoBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  & p {
    color: #fff;
    text-align: center;
  }
`;

const KeywordBox = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;

  & span {
    color: #e4e390;
    font-weight: 700;
    font-size: 18px;
    background-color: #121212;
    padding: 2px 10px;
    border-radius: 25px;
  }
`;

const ResultContainer = styled.div`
  padding: 8px;
  border-radius: 8px;
  margin: 16px 0;
`;

const ImgBox = styled.div`
  position: relative;
  aspect-ratio: 320 / 533;
  max-width: 320px;
  width: 100%;
  height: auto;
  margin: 24px auto;
`;

const TextBox = styled.div`
  width: 100%;
  padding: 16px;
  color: #fff;

  & span {
    padding: 2px;
  }
`;
