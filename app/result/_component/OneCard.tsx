"use client";

import { CategoryKeyword, TarotCardsData } from "@/types/tarotCardTypes";
import Image from "next/image";
import React from "react";
import styled from "styled-components";

type Props = {
  cardList: TarotCardsData[] | null;
  pickCategory: CategoryKeyword | null;
};

const OneCard = ({ cardList, pickCategory }: Props) => {
  return (
    <>
      {cardList?.map((item) => {
        return (
          <CardWrapper key={item.cardNo}>
            <CardImgBox>
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
                <KeywordBox>
                  {item.keyword[pickCategory].map((word, i) => (
                    <span key={i}>{word}</span>
                  ))}
                </KeywordBox>
              )}
              {pickCategory && <Message>{item.message[pickCategory]}</Message>}
            </InfoBox>
          </CardWrapper>
        );
      })}
    </>
  );
};

export default OneCard;

const CardWrapper = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;
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

const KeywordBox = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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
