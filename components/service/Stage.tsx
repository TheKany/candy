import { useUserSelectAnswer } from "@/store/useUserSelectAnswerStore";
import { Answer, AnswerBox, Box, QuestionText } from "./_serviceStyled";

const Stage = () => {
  const { stage, setStage } = useUserSelectAnswer();

  return (
    <Box>
      <QuestionText>
        Q. 이 고민은 당신의 삶에서 어떤 시기에 해당하나요?
      </QuestionText>
      <AnswerBox>
        <Answer
          onClick={() => setStage("start_phase")}
          $isSelected={stage === "start_phase"}
        >
          시작 단계
        </Answer>
        <Answer
          onClick={() => setStage("in_progress")}
          $isSelected={stage === "in_progress"}
        >
          진행 단계
        </Answer>
        <Answer
          onClick={() => setStage("decision_phase")}
          $isSelected={stage === "decision_phase"}
        >
          결정 단계
        </Answer>
        <Answer
          onClick={() => setStage("conclusion_phase")}
          $isSelected={stage === "conclusion_phase"}
        >
          마무리 단계
        </Answer>
      </AnswerBox>
    </Box>
  );
};

export default Stage;
