import { useUserSelectAnswer } from "@/store/handleUserSelect";
import { Answer, AnswerBox, Box, QuestionText } from "./serviceStyled";

const Emotion = () => {
  const { emotion, setEmotion } = useUserSelectAnswer();

  return (
    <Box>
      <QuestionText>
        Q. 지금 당신의 마음은 어떤 감정으로 채워져 있나요?
      </QuestionText>
      <AnswerBox>
        <Answer
          onClick={() => setEmotion("불안과 두려움")}
          $isSelected={emotion === "불안과 두려움"}
        >
          불안과 두려움
        </Answer>
        <Answer
          onClick={() => setEmotion("지침과 무기력")}
          $isSelected={emotion === "지침과 무기력"}
        >
          지침과 무기력
        </Answer>
        <Answer
          onClick={() => setEmotion("혼란과 방황")}
          $isSelected={emotion === "혼란과 방황"}
        >
          혼란과 방황
        </Answer>
        <Answer
          onClick={() => setEmotion("기대와 설렘")}
          $isSelected={emotion === "기대와 설렘"}
        >
          기대와 설렘
        </Answer>
        <Answer
          onClick={() => setEmotion("만족과 감사")}
          $isSelected={emotion === "만족과 감사"}
        >
          만족과 감사
        </Answer>
      </AnswerBox>
    </Box>
  );
};

export default Emotion;
