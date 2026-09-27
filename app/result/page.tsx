"use client";

import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useRouter } from "next/navigation";

import Wrapper from "@/components/_common/_Wrapper";
import { handleResetStore } from "@/util/handleResetStore";
import { useResetData } from "@/hooks/useResetData";
import OneCardResult from "@/components/result/OneCardResult";
import MonthlyReadingResult from "@/components/result/MonthlyReadingResult";
import ThreeCardResult from "@/components/result/ThreeCardResult";
import CelticCrossResult from "@/components/result/CelticCrossResult";
import { useTarotTypeStore } from "@/store/useTarotTypeStore";
import { useReadingSessionStore } from "@/store/useReadingSessionStore";
import ReadingSaveButtons from "@/components/result/ReadingSaveButtons";
import SaveToAccount from "@/components/account/SaveToAccount";


const Result = () => {
  const router = useRouter();
  const type = useTarotTypeStore((state) => state.type);

  const [isReady, setIsReady] = useState(false);
  const exitDialog = useRef<HTMLDialogElement>(null);
  const [saveBeforeExit, setSaveBeforeExit] = useState(false);
  const history = useReadingSessionStore(state => state.history);
  const downloadedCount = useReadingSessionStore(state => state.downloadedCount);
  const accountSavedRevision = useReadingSessionStore(state => state.accountSavedRevision);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady && !type) router.replace("/select");
  }, [isReady, type, router]);

  const leaveForHome = () => {
    exitDialog.current?.close();
    handleResetStore();
    router.replace("/");
  };
  const onClickHome = () => {
    const session = useReadingSessionStore.getState();
    if (session.history.length > Math.max(session.downloadedCount, session.accountSavedRevision)) {
      setSaveBeforeExit(false);
      exitDialog.current?.showModal();
    } else leaveForHome();
  };

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
  if (!isReady || !type) return null;

  return (
    <><Wrapper>
      {type === "monthly" ? (
          <MonthlyReadingResult onHome={onClickHome} />
        ) : type === "three" ? (
          <ThreeCardResult onHome={onClickHome} />
        ) : type === "five" ? (
          <ThreeCardResult mode="five" onHome={onClickHome} />
        ) : type === "celtic" ? (
          <CelticCrossResult onHome={onClickHome} />
        ) : (
          <OneCardResult onHome={onClickHome} />
        )}
    </Wrapper>
    <ExitDialog ref={exitDialog} aria-labelledby="leave-reading-title">
      <button className="close" type="button" onClick={() => exitDialog.current?.close()}>닫기</button>
      <h2 id="leave-reading-title">{saveBeforeExit ? "지금까지의 이야기 저장하기" : "지금까지의 이야기를 저장하지 않고 나갈까요?"}</h2>
      {saveBeforeExit ? <><SaveToAccount /><ReadingSaveButtons data={{ title: "처음부터 이어진 우리의 이야기", sections: [], readings: history.map(entry => entry.data) }}
        onDownloaded={() => useReadingSessionStore.getState().markDownloaded(history.length)} /></>
        : <><p>홈으로 돌아가면 현재 상담 기록은 사라져요.</p><button type="button" onClick={() => setSaveBeforeExit(true)}>저장하러 가기</button></>}
      <button type="button" onClick={leaveForHome}>{history.length <= Math.max(downloadedCount, accountSavedRevision) ? "홈으로" : "저장하지 않고 홈으로"}</button>
    </ExitDialog></>
  );
};

export default Result;
const ExitDialog = styled.dialog`
  box-sizing:border-box;width:calc(100% - 28px);max-width:400px;max-height:85dvh;margin:auto;
  padding:24px;border:1px solid #d8bf8a;border-radius:22px;background:#123a2b;color:#fff7df;overflow-y:auto;
  &::backdrop{background:#03150fbb;backdrop-filter:blur(4px);}
  h2{font-size:20px;line-height:1.7;margin:12px 0;}p{font-size:14px;line-height:1.8;}
  > button{display:block;width:100%;min-height:44px;padding:12px;margin-top:12px;border:1px solid #cfb575;border-radius:12px;color:inherit;background:transparent;cursor:pointer;}
  > .close{width:auto;margin:0 0 0 auto;border:0;}button:focus-visible{outline:2px solid #edcf8a;outline-offset:3px;}
`;
