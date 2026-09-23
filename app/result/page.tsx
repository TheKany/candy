"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Wrapper from "@/components/_common/_Wrapper";
import { handleResetStore } from "@/util/handleResetStore";
import Loading from "@/components/_common/Loading";
import { useResetData } from "@/hooks/useResetData";
import OneCardResult from "@/components/result/OneCardResult";
import MonthlyReadingResult from "@/components/result/MonthlyReadingResult";
import ThreeCardResult from "@/components/result/ThreeCardResult";
import CelticCrossResult from "@/components/result/CelticCrossResult";
import { useTarotTypeStore } from "@/store/useTarotTypeStore";


const Result = () => {
  const router = useRouter();
  const type = useTarotTypeStore((state) => state.type);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !type) router.replace("/select");
  }, [isLoading, type, router]);

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
  return (
    <Wrapper>
      {isLoading ? (
        <Loading />
      ) : (
        type === "monthly" ? (
          <MonthlyReadingResult onHome={onClickHome} />
        ) : type === "three" ? (
          <ThreeCardResult onHome={onClickHome} />
        ) : type === "five" ? (
          <ThreeCardResult mode="five" onHome={onClickHome} />
        ) : type === "celtic" ? (
          <CelticCrossResult onHome={onClickHome} />
        ) : (
          <OneCardResult onHome={onClickHome} />
        )
      )}
    </Wrapper>
  );
};

export default Result;
