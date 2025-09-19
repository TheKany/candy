import { useUserSelectAnswer } from "@/store/useUserSelectAnswerStore";
import { Answer, AnswerBox, Box, QuestionText } from "./_serviceStyled";

const Emotion = () => {
  const { emotion, setEmotion } = useUserSelectAnswer();

  return (
    <Box>
      <QuestionText>
        Q. 지금 당신의 마음은 어떤 감정으로 채워져 있나요?
      </QuestionText>
      <AnswerBox>
        <Answer
          onClick={() => setEmotion("anxiety_fear")}
          $isSelected={emotion === "anxiety_fear"}
        >
          불안과 두려움
        </Answer>
        <Answer
          onClick={() => setEmotion("exhaustion_lethargy")}
          $isSelected={emotion === "exhaustion_lethargy"}
        >
          지침과 무기력
        </Answer>
        <Answer
          onClick={() => setEmotion("confusion_wandering")}
          $isSelected={emotion === "confusion_wandering"}
        >
          혼란과 방황
        </Answer>
        <Answer
          onClick={() => setEmotion("excitement_thrill")}
          $isSelected={emotion === "excitement_thrill"}
        >
          기대와 설렘
        </Answer>
        <Answer
          onClick={() => setEmotion("satisfaction_gratitude")}
          $isSelected={emotion === "satisfaction_gratitude"}
        >
          만족과 감사
        </Answer>
      </AnswerBox>
    </Box>
  );
};

export default Emotion;
