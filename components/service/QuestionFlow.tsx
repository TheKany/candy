"use client";

import React from "react";
import { Answer, BtnBox, Question, QuestionBox } from "./serviceStyle";
import { usePickCardStore } from "@/store/pickCardStore";
import { flowDisplayKor, flowKeywordList } from "@/types/worryTypes";

const QuestionPick = () => {
  const pickedFlow = usePickCardStore((state) => state.pickedFlow);
  const setPickedFlow = usePickCardStore((state) => state.setPickedFlow);

  return (
    <QuestionBox>
      <Question>이 고민은 얼마나 진행되었나요?</Question>
      <BtnBox>
        {flowKeywordList.map((flow) => {
          if (flow) {
            return (
              <Answer
                $clicked={flow === pickedFlow}
                key={flow}
                onClick={() => setPickedFlow(flow)}
              >
                {flowDisplayKor[flow]}
              </Answer>
            );
          }
        })}
      </BtnBox>
    </QuestionBox>
  );
};

export default QuestionPick;
