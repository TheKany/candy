"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

const Loading = () => {
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAngle((prev) => prev + 180);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <CenterWrapper>
      <RotatingImage
        src="/sandClock.png"
        alt="로딩 모래시계"
        width={200}
        height={200}
        $angle={angle}
      />
      <p>조금만 기다려 주세요 </p>
      <p>타로가 익고 있어요 🍰</p>
    </CenterWrapper>
  );
};

export default Loading;

const CenterWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  & p {
    color: #fff;
  }
`;

const RotatingImage = styled(Image)<{ $angle: number }>`
  transition: transform 0.5s ease-in-out;
  transform: rotate(${({ $angle }) => $angle}deg);
`;
