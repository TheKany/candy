"use client";

import TarotBoard from "@/components/tarot/TarotBoard";
import { useShuffleType } from "@/store/shuffleTypeStore";
import { fade } from "@/styles/fadeAnimation";
import React from "react";
import styled from "styled-components";

const Service = () => {
  const { shuffleStep } = useShuffleType();

  return (
    <div>
      {shuffleStep === null && (
        <HeadTitleText>당신의 고민은 무엇인가요?</HeadTitleText>
      )}

      {shuffleStep === 1 ? (
        <TextWrapper>
          <TitleText>마음을 비우고 카드를 섞어볼까요.</TitleText>
          <SubText>카드가 섞이는 동안 숨을 고르며 마음을 비워주세요.</SubText>
        </TextWrapper>
      ) : null}

      {shuffleStep === 2 ? (
        <TextWrapper>
          <TitleText>
            이번엔 질문을 떠올리며 <br /> 카드를 섞어볼까요.
          </TitleText>
          <SubText>카드가 섞이는 동안 명확한 질문을 떠올려주세요.</SubText>
        </TextWrapper>
      ) : null}

      {shuffleStep === 3 ? (
        <TextWrapper>
          <TitleText>카드를 골라볼까요</TitleText>
          <SubText>카드를 뽑을 위치를 골라주세요.</SubText>
        </TextWrapper>
      ) : null}

      <TarotBoard />
    </div>
  );
};

export default Service;

const TextWrapper = styled.div`
  animation: ${fade} 0.5s ease-in-out;
`;

const HeadTitleText = styled.p`
  color: #fff;
  font-size: 28px;
  font-weight: 700;
  text-align: center;
`;

const TitleText = styled.p`
  color: #fff;
  font-size: 24px;
  font-weight: 500;
  text-align: center;
`;

const SubText = styled.p`
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  padding-top: 16px;
`;
