"use client";

import Wrapper from "@/components/_common/_Wrapper";
import QuestionEmotion from "@/components/service/QuestionEmotion";
import QuestionPick from "@/components/service/QuestionFlow";
import QuestionWorry from "@/components/service/QuestionWorry";
import {
  LinkBox,
  MainTitle,
  ShuffleBtn,
} from "@/components/service/serviceStyle";
import { useResetData } from "@/hooks/useResetData";
import { usePickCard } from "@/store/pickCardStore";
import { handleResetStore } from "@/util/handleResetStore";

const Service = () => {
  const { pickedWorry, pickedEmotion, pickedFlow } = usePickCard();

  useResetData(handleResetStore);

  return (
    <Wrapper>
      <MainTitle>먼저 당신의 이야기를 들려주세요</MainTitle>

      <QuestionWorry />

      <QuestionEmotion />

      <QuestionPick />

      <LinkBox>
        {!!pickedWorry && !!pickedEmotion && !!pickedFlow ? (
          <ShuffleBtn href="/shuffle">카드 섞기</ShuffleBtn>
        ) : null}
      </LinkBox>
    </Wrapper>
  );
};

export default Service;
