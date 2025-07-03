"use client";

import { CategoryKeyword, TarotCardsData } from "@/types/tarotCardTypes";
import Image from "next/image";
import React from "react";
import styled from "styled-components";

type Props = {
  cardList: TarotCardsData[] | null;
  pickCategory: CategoryKeyword | null;
  scoreArr: number[];
};

const YesOrNoCard = ({ cardList, pickCategory, scoreArr }: Props) => {
  return (
    <>
      <SubCardContainer>
        {cardList?.slice(0, 2).map((item, idx) => (
          <SubCardWrapper key={item.cardNo}>
            <NorText $idx={idx}>
              {idx === 0 ? "현재의 상황" : "주변의 영향"}
            </NorText>
            <CardImgBox $idx={1}>
              <Score $score={scoreArr[idx]}>
                {scoreArr[idx] > 0 ? `+${scoreArr[idx]}` : scoreArr[idx]}
              </Score>
              <Image
                src={`/cards/card${item.cardNo}.webp`}
                alt={item.name}
                width={0}
                height={0}
                fill
                unoptimized
              />
            </CardImgBox>
            <InfoBox>
              <Name>{item.name}</Name>
              <Nickname>- {item.nickname} -</Nickname>

              {pickCategory && (
                <KeywordBox $idx={1}>
                  {item.keyword[pickCategory].map((word, i) => (
                    <span key={i}>{word}</span>
                  ))}
                </KeywordBox>
              )}
              {pickCategory && <Message>{item.message[pickCategory]}</Message>}
            </InfoBox>
          </SubCardWrapper>
        ))}
      </SubCardContainer>

      {cardList?.[2] && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <NorText $idx={2}>결론의 방향성</NorText>
          <CardImgBox $idx={2}>
            {pickCategory !== null && (
              <Score $score={scoreArr[2]}>{scoreArr[2]}</Score>
            )}
            <Image
              src={`/cards/card${cardList[2].cardNo}.webp`}
              alt={cardList[2].name}
              width={0}
              height={0}
              fill
              unoptimized
            />
          </CardImgBox>
          <InfoBox>
            <Name>{cardList[2].name}</Name>
            <Nickname>- {cardList[2].nickname} -</Nickname>

            {pickCategory && (
              <KeywordBox $idx={2}>
                {cardList[2].keyword[pickCategory].map((word, i) => (
                  <span key={i}>{word}</span>
                ))}
              </KeywordBox>
            )}
            {pickCategory && (
              <Message>{cardList[2].message[pickCategory]}</Message>
            )}
          </InfoBox>
        </div>
      )}
    </>
  );
};

export default YesOrNoCard;

const SubCardContainer = styled.div`
  display: flex;
`;

const SubCardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const NorText = styled.p<{ $idx: number }>`
  background-color: ${({ $idx }) =>
    $idx === 0 ? "#52667c" : $idx === 1 ? "#4caf50" : "#fdd835"};
  color: ${({ $idx }) => ($idx === 0 || $idx === 1 ? "#fff" : "#121212")};
  font-size: 16px;
  text-align: center;
  width: 100%;
  padding: 4px 0;
  margin-bottom: 16px;

  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InfoBox = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
`;

const KeywordBox = styled.div<{ $idx: number }>`
  display: grid;
  grid-template-columns: ${({ $idx }) =>
    $idx === 2 ? "repeat(2, 1fr)" : "repeat(1, 1fr)"};
  gap: 4px;
  margin: 8px 0;

  & span {
    background-color: #fff;
    padding: ${({ $idx }) => ($idx === 2 ? "8px 4px" : "4px 2px")};
    border-radius: 4px;
    text-align: center;
    font-weight: 500;
  }
`;

const CardImgBox = styled.div<{ $idx: number }>`
  position: relative;

  width: 60%;
  height: ${({ $idx }) => ($idx === 2 ? null : "150px")};
  aspect-ratio: 2 / 3;
`;

const Score = styled.div<{ $score: number }>`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ $score }) =>
    $score > 0 ? "#A5D8FF" : $score < 0 ? "#FFB3B3" : "#E0E0E0"};
  color: #121212;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  z-index: 1;
`;

const Name = styled.div`
  margin: 8px 0;
  font-size: 24px;
  font-weight: 500;
  color: #ebe9a8;
`;

const Nickname = styled.div`
  margin: 8px 0;
  font-size: 20px;
  font-weight: 500;
  color: #a8ebc2;
`;

const Message = styled.p`
  font-size: 16px;
  color: aliceblue;
  width: 80%;
`;
