"use client";

import { handleUserFeedback } from "@/util/handleUserFeedback";
import React, { useState } from "react";
import styled from "styled-components";

const Feedback = () => {
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitFeedback = async () => {
    const result = await handleUserFeedback(feedback);
    if (result === "ok") {
      setSubmitted(true);
      setFeedback("");
    } else {
      alert("피드백 전송 중 오류가 발생했어요 😢");
    }
  };

  return (
    <FeedbackBox>
      <p>달콤한 타르트처럼</p>
      <p>오늘의 타로도 당신에게 작은 위로가 되었길바래요</p>
      <p>복채는 마음으로 받았어요 :) </p>
      <p>대신 피드백 한번 부탁드려도 될까요?</p>

      {!submitted ? (
        <>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="좋았던 점이나 아쉬웠던 점을 자유롭게 적어주세요"
          />
          <button onClick={submitFeedback}>피드백 보내기</button>
        </>
      ) : (
        <p>🍓 소중한 피드백 감사합니다!</p>
      )}
    </FeedbackBox>
  );
};

export default Feedback;

const FeedbackBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 16px 0;

  & p {
    text-align: center;
    color: #fff;
  }

  & textarea {
    width: 100%;
    margin-top: 8px;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 8px;
    font-size: 14px;
    resize: none;
    min-height: 80px;
  }

  & button {
    margin-top: 8px;
    padding: 8px 16px;
    border-radius: 8px;
    background-color: #ecd0a1;
    color: #121212;
    font-weight: bold;
  }
`;
