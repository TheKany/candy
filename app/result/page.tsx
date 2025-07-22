"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Wrapper from "@/components/_common/_Wrapper";
import TarotResult from "@/components/result/TarotResult";
import KakaoShareButton from "@/components/_common/KakaoShareButton";
import { handleResetStore } from "@/util/handleResetStore";
import Loading from "@/components/_common/Loading";
import styled from "styled-components";
import dynamic from "next/dynamic";
import Feedback from "@/components/result/Feedback";

const AdBanner = dynamic(() => import("@/components/_common/AdBanner"), {
  ssr: false,
});

const Result = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const onClickHome = () => {
    handleResetStore();
    router.replace("/");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      handleResetStore();
    };

    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  return (
    <Wrapper>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <TarotResult />

          <Feedback />

          <ButtonBox>
            <button onClick={onClickHome}>홈으로</button>
            <KakaoShareButton />
          </ButtonBox>

          <AdBanner />
        </>
      )}
    </Wrapper>
  );
};

export default Result;

const ButtonBox = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;

  & button {
    width: 100%;
    border-radius: 8px;
    background-color: #fff;
  }
  & :nth-child(1) {
    color: #121212;
    padding: 8px 0;
  }

  & :nth-child(2) {
    background-color: #121212;
    color: #fee500;
    padding: 8px 0;
  }
`;
