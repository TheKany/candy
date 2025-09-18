import { useUserSelectAnswer } from "@/store/handleUserSelect";
import { Answer, AnswerBox, Box, QuestionText } from "./serviceStyled";

const Change = () => {
  const { change, setChange } = useUserSelectAnswer();
  return (
    <Box>
      <QuestionText>
        Q. 이 고민이 해결된다면 당신에게 가장 큰 변화는 무엇일까요?
      </QuestionText>
      <AnswerBox>
        <Answer
          onClick={() => setChange("마음의 평화")}
          $isSelected={change === "마음의 평화"}
        >
          마음의 평화
        </Answer>
        <Answer
          onClick={() => setChange("새로운 시작")}
          $isSelected={change === "새로운 시작"}
        >
          새로운 시작
        </Answer>
        <Answer
          onClick={() => setChange("확고한 확신")}
          $isSelected={change === "확고한 확신"}
        >
          확고한 확신
        </Answer>
        <Answer
          onClick={() => setChange("긍정적인 관계")}
          $isSelected={change === "긍정적인 관계"}
        >
          긍정적인 관계
        </Answer>
        <Answer
          onClick={() => setChange("물질적 안정")}
          $isSelected={change === "물질적 안정"}
        >
          물질적 안정
        </Answer>
      </AnswerBox>
    </Box>
  );
};

export default Change;
