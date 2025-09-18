import { useUserSelectAnswer } from "@/store/handleUserSelect";
import { Answer, AnswerBox, Box, QuestionText } from "./serviceStyled";

const Cause = () => {
  const { cause, setCause } = useUserSelectAnswer();

  return (
    <Box>
      <QuestionText>
        Q. 이 고민의 가장 근본적인 원인은 무엇이라고 생각하시나요?
      </QuestionText>
      <AnswerBox>
        <Answer
          onClick={() => setCause("외부적 요인")}
          $isSelected={cause === "외부적 요인"}
        >
          외부적 요인
        </Answer>
        <Answer
          onClick={() => setCause("내부적 요인")}
          $isSelected={cause === "내부적 요인"}
        >
          내부적 요인
        </Answer>
        <Answer
          onClick={() => setCause("잘 모르겠음")}
          $isSelected={cause === "잘 모르겠음"}
        >
          잘 모르겠음
        </Answer>
      </AnswerBox>
    </Box>
  );
};

export default Cause;
