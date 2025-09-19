"use client";

import Wrapper from "@/components/_common/_Wrapper";
import Cause from "@/components/service/Cause";
import Change from "@/components/service/Change";
import Emotion from "@/components/service/Emotion";
import Relationship from "@/components/service/Relationship";
import Stage from "@/components/service/Stage";
import { useResetData } from "@/hooks/useResetData";
import { useUserSelectAnswer } from "@/store/useUserSelectAnswerStore";
import { handleResetStore } from "@/util/handleResetStore";
import { useRouter } from "next/navigation";
import styled from "styled-components";

const Service = () => {
  const router = useRouter();
  const { emotion, relationship, stage, cause, change } = useUserSelectAnswer();

  const allAnswersSelected =
    !!emotion && !!relationship && !!stage && !!cause && !!change;

  useResetData(handleResetStore);

  const onLinkBtn = () => {
    allAnswersSelected && router.push("/shuffle");
  };

  return (
    <Wrapper>
      <PageTitle>먼저 당신의 이야기를 들려주세요</PageTitle>

      {/* 1. 원인 */}
      <Cause />

      {/* 2. 관계 */}
      <Relationship />

      {/* 3. 시기 */}
      <Stage />

      {/* 4. 감정 */}
      <Emotion />

      {/* 5. 변화 */}
      <Change />

      <ShuffleButton onClick={onLinkBtn} $allPicked={allAnswersSelected}>
        카드 섞기
      </ShuffleButton>
    </Wrapper>
  );
};

export default Service;

const PageTitle = styled.p`
  color: #d4af37;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 16px;
`;

const ShuffleButton = styled.button<{ $allPicked: boolean }>`
  width: 100%;
  padding: 16px;
  background-color: #e46b2e;
  border-radius: 8px;
  font-size: 500;
`;
