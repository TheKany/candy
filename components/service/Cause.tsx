import { useUserSelectAnswer } from "@/store/useUserSelectAnswerStore";
import { Answer, AnswerBox, Box, QuestionText } from "./_serviceStyled";

const Cause = () => {
  const { cause, setCause } = useUserSelectAnswer();

  return (
    <Box>
      <QuestionText>
        Q. 이 고민의 가장 근본적인 원인은 무엇이라고 생각하시나요?
      </QuestionText>
      <AnswerBox>
        <Answer
          onClick={() => setCause("external_factors")}
          $isSelected={cause === "external_factors"}
        >
          외부적 요인
        </Answer>
        <Answer
          onClick={() => setCause("internal_factors")}
          $isSelected={cause === "internal_factors"}
        >
          내부적 요인
        </Answer>
        <Answer
          onClick={() => setCause("not_sure")}
          $isSelected={cause === "not_sure"}
        >
          잘 모르겠음
        </Answer>
      </AnswerBox>
    </Box>
  );
};

export default Cause;
