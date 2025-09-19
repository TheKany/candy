import styled from "styled-components";

export const Box = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-bottom: 16px;
`;

export const QuestionText = styled.p`
  color: #b0e0e6;
  font-size: 14px;
  font-weight: 700;
  width: 100%;
  text-align: start;
  margin-bottom: 8px;
`;

export const AnswerBox = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

export const AnswerText = styled.p`
  color: #fff;
  font-size: 14px;
  width: 100%;
  text-align: start;
`;

export const Answer = styled.button<{ $isSelected: boolean }>`
  display: flex;
  flex-direction: column;
  padding: 8px 16px;
  background-color: ${(props) => (props.$isSelected ? "#8a2be2" : "#fff")};
  color: ${(props) => (props.$isSelected ? "#fff" : "#121212")};
  border-radius: 8px;
  width: 40%;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
`;
