import { useUserSelectAnswer } from "@/store/handleUserSelect";
import { Answer, AnswerBox, Box, QuestionText } from "./serviceStyled";

const Relationship = () => {
  const { relationship, setRelationship } = useUserSelectAnswer();
  return (
    <Box>
      <QuestionText>
        Q. 이 고민은 어떤 관계와 가장 깊이 연결되어 있나요?
      </QuestionText>
      <AnswerBox>
        <Answer
          onClick={() => setRelationship("나 자신")}
          $isSelected={relationship === "나 자신"}
        >
          나 자신
        </Answer>
        <Answer
          onClick={() => setRelationship("한 사람")}
          $isSelected={relationship === "한 사람"}
        >
          한 사람
        </Answer>
        <Answer
          onClick={() => setRelationship("집단")}
          $isSelected={relationship === "집단"}
        >
          집단
        </Answer>
        <Answer
          onClick={() => setRelationship("대상 없음")}
          $isSelected={relationship === "대상 없음"}
        >
          대상 없음
        </Answer>
      </AnswerBox>
    </Box>
  );
};

export default Relationship;
