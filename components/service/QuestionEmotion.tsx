"use client";

import React from "react";
import { Answer, BtnBox, Question, QuestionBox } from "./serviceStyle";
import { usePickCardStore } from "@/store/pickCardStore";
import { emotionDisplayKor, emotionKeywordList } from "@/types/worryTypes";

const QuestionEmotion = () => {
  const pickedEmotion = usePickCardStore((state) => state.pickedEmotion);
  const setPickedEmotion = usePickCardStore((state) => state.setPickedEmotion);

  return (
    <QuestionBox>
      <Question>이 고민을 떠올리면 어떤 감정인가요?</Question>
      <BtnBox>
        {emotionKeywordList.map((emotion) => {
          if (emotion) {
            return (
              <Answer
                $clicked={emotion === pickedEmotion}
                key={emotion}
                onClick={() => setPickedEmotion(emotion)}
              >
                {emotionDisplayKor[emotion]}
              </Answer>
            );
          }
        })}
      </BtnBox>
    </QuestionBox>
  );
};

export default QuestionEmotion;
