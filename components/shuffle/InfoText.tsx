import React from "react";
import styled from "styled-components";
import { SHUFFLE_GUIDANCE } from "@/util/cardSelectionFlow";

type Props = {
  finishedShuffle: boolean;
};

const InfoText = ({ finishedShuffle }: Props) => {
  return (
    <TextContainer aria-live="polite">
      {!finishedShuffle ? (
        <ShuffleMessage>{SHUFFLE_GUIDANCE.shuffling}</ShuffleMessage>
      ) : (
        <>
          <ReadyMessage>{SHUFFLE_GUIDANCE.ready}</ReadyMessage>
          <WarningMessage>{SHUFFLE_GUIDANCE.warning}</WarningMessage>
        </>
      )}
    </TextContainer>
  );
};

export default InfoText;

const TextContainer = styled.div`
  min-height: 76px;
  padding: 18px 16px 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 5px;
  text-align: center;
  color: #d4af37;
`;

const ShuffleMessage = styled.p`
  max-width: 320px;
  font-size: clamp(14px, 4.6vw, 17px);
  line-height: 1.6;
  font-weight: 600;
  word-break: keep-all;
`;

const ReadyMessage = styled.p`
  font-size: 15px;
`;

const WarningMessage = styled.p`
  font-weight: 700;
  font-size: clamp(15px, 5vw, 18px);
  line-height: 1.5;
  padding-bottom: 2px;
  border-bottom: 1px solid #d4af37;
  word-break: keep-all;
`;
