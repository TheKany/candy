import { useUserSelectAnswer } from "@/store/useUserSelectAnswerStore";
import { Answer, AnswerBox, Box, QuestionText } from "./_serviceStyled";

const Relationship = () => {
  const { relationship, setRelationship } = useUserSelectAnswer();

  return (
    <Box>
      <QuestionText>
        Q. 이 고민은 어떤 관계와 가장 깊이 연결되어 있나요?
      </QuestionText>
      <AnswerBox>
        <Answer
          onClick={() => setRelationship("myself")}
          $isSelected={relationship === "myself"}
        >
          나 자신
        </Answer>
        <Answer
          onClick={() => setRelationship("one_person")}
          $isSelected={relationship === "one_person"}
        >
          한 사람
        </Answer>
        <Answer
          onClick={() => setRelationship("group")}
          $isSelected={relationship === "group"}
        >
          집단
        </Answer>
        <Answer
          onClick={() => setRelationship("no_subject")}
          $isSelected={relationship === "no_subject"}
        >
          대상 없음
        </Answer>
      </AnswerBox>
    </Box>
  );
};

export default Relationship;
