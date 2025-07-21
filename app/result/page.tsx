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
    const handlePopState = () => {
      handleResetStore();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <Wrapper>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <div style={{ minHeight: "300px" }}>
            <TarotResult />
            <ButtonBox>
              <button onClick={onClickHome}>홈으로</button>
              <KakaoShareButton />
            </ButtonBox>
          </div>
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
