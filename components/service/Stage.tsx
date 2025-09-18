import { useUserSelectAnswer } from "@/store/handleUserSelect";
import { Answer, AnswerBox, Box, QuestionText } from "./serviceStyled";

const Stage = () => {
  const { stage, setStage } = useUserSelectAnswer();
  return (
    <Box>
      <QuestionText>
        Q. 이 고민은 당신의 삶에서 어떤 시기에 해당하나요?
      </QuestionText>
      <AnswerBox>
        <Answer
          onClick={() => setStage("시작 단계")}
          $isSelected={stage === "시작 단계"}
        >
          시작 단계
        </Answer>
        <Answer
          onClick={() => setStage("진행 단계")}
          $isSelected={stage === "진행 단계"}
        >
          진행 단계
        </Answer>
        <Answer
          onClick={() => setStage("결정 단계")}
          $isSelected={stage === "결정 단계"}
        >
          결정 단계
        </Answer>
        <Answer
          onClick={() => setStage("마무리 단계")}
          $isSelected={stage === "마무리 단계"}
        >
          마무리 단계
        </Answer>
      </AnswerBox>
    </Box>
  );
};

export default Stage;
