"use client";

import React from "react";
import { Answer, BtnBox, Question, QuestionBox } from "./serviceStyle";
import { worryDisplayKor, worryKeywordList } from "@/types/worryTypes";
import { usePickCard } from "@/store/pickCardStore";

const QuestionWorry = () => {
  const { pickedWorry, setPickedWorry } = usePickCard();

  return (
    <QuestionBox>
      <Question>어떤 고민에 여기 오셨나요?</Question>
      <BtnBox>
        {worryKeywordList.map((worry) => {
          if (worry) {
            return (
              <Answer
                $clicked={worry === pickedWorry}
                key={worry}
                onClick={() => setPickedWorry(worry)}
              >
                {worryDisplayKor[worry]}
              </Answer>
            );
          }
        })}
      </BtnBox>
    </QuestionBox>
  );
};

export default QuestionWorry;
