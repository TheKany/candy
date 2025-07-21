"use client";

import { usePickCard } from "@/store/pickCardStore";
import { useShuffleType } from "@/store/shuffleTypeStore";
import { useTarotType } from "@/store/tarotTypeStore";
import Wrapper from "@/components/_common/_Wrapper";
import { useRouter } from "next/navigation";
import TarotResult from "@/components/result/TarotResult";
import KakaoShareButton from "@/components/_common/KakaoShareButton";

const Result = () => {
  const router = useRouter();
  const { resetPickKeyword } = usePickCard();
  const { resetType } = useTarotType();
  const { resetShuffleStep } = useShuffleType();

  const onClickShare = () => {};

  return (
    <Wrapper>
      <TarotResult />

      <div>
        <button>홈으로</button>
        <KakaoShareButton />
      </div>
    </Wrapper>
  );
};

export default Result;
