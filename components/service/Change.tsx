import { useUserSelectAnswer } from "@/store/useUserSelectAnswerStore";
import { Answer, AnswerBox, Box, QuestionText } from "./_serviceStyled";

const Change = () => {
  const { change, setChange } = useUserSelectAnswer();

  return (
    <Box>
      <QuestionText>
        Q. 이 고민이 해결된다면 당신에게 가장 큰 변화는 무엇일까요?
      </QuestionText>
      <AnswerBox>
        <Answer
          onClick={() => setChange("peace_of_mind")}
          $isSelected={change === "peace_of_mind"}
        >
          마음의 평화
        </Answer>
        <Answer
          onClick={() => setChange("new_beginning")}
          $isSelected={change === "new_beginning"}
        >
          새로운 시작
        </Answer>
        <Answer
          onClick={() => setChange("firm_conviction")}
          $isSelected={change === "firm_conviction"}
        >
          확고한 확신
        </Answer>
        <Answer
          onClick={() => setChange("positive_relationships")}
          $isSelected={change === "positive_relationships"}
        >
          긍정적인 관계
        </Answer>
        <Answer
          onClick={() => setChange("material_stability")}
          $isSelected={change === "material_stability"}
        >
          물질적 안정
        </Answer>
      </AnswerBox>
    </Box>
  );
};

export default Change;
