"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Wrapper from "@/components/_common/_Wrapper";
import KakaoShareButton from "@/components/_common/KakaoShareButton";
import { handleResetStore } from "@/util/handleResetStore";
import Loading from "@/components/_common/Loading";
import styled from "styled-components";
import dynamic from "next/dynamic";
import Feedback from "@/components/result/Feedback";
import { useResetData } from "@/hooks/useResetData";
import OneCardResult from "@/components/result/OneCardResult";
import ThreeCardResult from "@/components/result/ThreeCardResult";
import CelticCrossResult from "@/components/result/CelticCrossResult";
import { useTarotTypeStore } from "@/store/useTarotTypeStore";

const AdBanner = dynamic(() => import("@/components/_common/AdBanner"), {
  ssr: false,
});

const Result = () => {
  const router = useRouter();
  const type = useTarotTypeStore((state) => state.type);

  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const onClickHome = () => {
    handleResetStore();
    router.replace("/");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = ["android", "iphone", "ipad", "ipod"];
    const isMobileDevice = mobileKeywords.some((keyword) =>
      userAgent.includes(keyword)
    );
    setIsMobile(isMobileDevice);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const logUserCount = async () => {
      try {
        await fetch("/api/countUsers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.error("Failed to log tarot count:", error);
      }
    };

    logUserCount();
  }, []);

  useResetData(handleResetStore);
  console.log(isMobile);
  return (
    <Wrapper>
      {isLoading ? (
        <Loading />
      ) : (
        type === "three" ? (
          <ThreeCardResult onHome={onClickHome} />
        ) : type === "celtic" ? (
          <CelticCrossResult onHome={onClickHome} />
        ) : (
          <>
            <OneCardResult />
            <Feedback />

            <ButtonBox $isMobile={isMobile}>
              <button onClick={onClickHome}>홈으로</button>
              {isMobile && <KakaoShareButton />}
            </ButtonBox>

            <AdBanner />
          </>
        )
      )}
    </Wrapper>
  );
};

export default Result;

const ButtonBox = styled.div<{ $isMobile: boolean }>`
  display: flex;
  gap: 8px;

  & > button {
    width: ${({ $isMobile }) => ($isMobile ? "calc(50% - 4px)" : "100%")};
    border-radius: 8px;
    background-color: #fff;
    color: #121212;
    padding: 8px 0;
  }

  & > button:nth-child(2) {
    background-color: #121212;
    color: #fee500;
    padding: 8px 0;
    width: 50%;
  }
`;
