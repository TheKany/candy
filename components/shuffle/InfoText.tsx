import React from "react";
import styled from "styled-components";

type Props = {
  finishedShuffle: boolean;
};

const InfoText = ({ finishedShuffle }: Props) => {
  return (
    <TextContainer $isFinish={finishedShuffle}>
      <p>카드를 뽑아볼까요?</p>
      <p>운명은 한번 결정하면 되돌릴 수 없습니다</p>
    </TextContainer>
  );
};

export default InfoText;

const TextContainer = styled.div<{ $isFinish: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  opacity: ${({ $isFinish }) => ($isFinish ? 1 : 0)};
  visibility: ${({ $isFinish }) => ($isFinish ? "visible" : "hidden")};

  transition: opacity 0.5s ease-in-out, visibility 0.5s ease-in-out;

  & :nth-child(1) {
    color: #d4af37;
  }

  & :nth-child(2) {
    color: #d4af37;
    font-weight: 700;
    font-size: 18px;
    padding-bottom: 2px;
    border-bottom: 1px solid #d4af37;
  }
`;
