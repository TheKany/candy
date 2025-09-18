"use client";

import Wrapper from "@/components/_common/_Wrapper";
import Cause from "@/components/service/Cause";
import Change from "@/components/service/Change";
import Emotion from "@/components/service/Emotion";
import Relationship from "@/components/service/Relationship";
import Stage from "@/components/service/Stage";
import { useResetData } from "@/hooks/useResetData";
import { useUserSelectAnswer } from "@/store/handleUserSelect";
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
      <p>먼저 당신의 이야기를 들려주세요</p>

      {/* 1. 감정 */}
      <Emotion />

      {/* 2. 관계 */}
      <Relationship />

      {/* 3. 시기 */}
      <Stage />

      {/* 4. 원인 */}
      <Cause />

      {/* 5. 변화 */}
      <Change />

      <ShuffleButton onClick={onLinkBtn} $allPicked={allAnswersSelected}>
        카드 섞기
      </ShuffleButton>
    </Wrapper>
  );
};

export default Service;

const ShuffleButton = styled.button<{ $allPicked: boolean }>`
  width: 100%;
  padding: 16px;
  background-color: #e46b2e;
  border-radius: 8px;
  font-size: 500;
`;
