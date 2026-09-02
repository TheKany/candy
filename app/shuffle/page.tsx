"use client";
import { useEffect, useRef, useState } from "react";
import { getRandomCardNo } from "@/util/getRandomCardNo";
import { handleCardShufflePosition } from "@/util/handleCardShufflePosition";
import { getCardCount } from "@/util/getCardData";

import NumberPad from "@/components/shuffle/NumberPad";
import TarotCardBoard from "@/components/shuffle/TarotCardBoard";
import InfoText from "@/components/shuffle/InfoText";
import PickCardBoard from "@/components/shuffle/PickCardBoard";
import { handleResetCardProgress } from "@/util/handleResetStore";
import { useResetData } from "@/hooks/useResetData";
import { useShuffleTypeStore } from "@/store/useShuffleTypeStore";
import { useTarotTopicStore } from "@/store/useTarotTopicStore";
import { useTarotTypeStore } from "@/store/useTarotTypeStore";
import { useUserPickNum } from "@/store/useUserPickNumStore";
import { shouldOpenResultAfterReveal } from "@/util/cardSelectionFlow";
import { getReadingFlowRedirect } from "@/util/tarotFlow";
import { useRouter } from "next/navigation";

type PositionProps = {
  top: string;
  left: string;
  rotate: number;
};

const ShufflePage = () => {
  const router = useRouter();
  const setShuffleStep = useShuffleTypeStore((state) => state.setShuffleStep);
  const type = useTarotTypeStore((state) => state.type);
  const topic = useTarotTopicStore((state) => state.topic);
  const pickedCount = useUserPickNum((state) => state.inputs.length);

  const [cardCnt, setCardCnt] = useState<number>(0);
  const [positions, setPositions] = useState<PositionProps[]>([]);
  const [isRotating, setIsRotating] = useState(false);
  const [finishedShuffle, setFinishedShuffle] = useState(false);
  const [deck, setDeck] = useState<number[]>([]);
  const [selectionLocked, setSelectionLocked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hasGatheredCards = useRef(false);
  const resultTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCardRevealComplete = () => {
    const revealCompletesSelection = shouldOpenResultAfterReveal(
      type,
      pickedCount,
      true
    );

    if (!revealCompletesSelection) {
      setSelectionLocked(false);
      return;
    }

    resultTimer.current = setTimeout(() => {
      router.replace("/result");
    }, 450);
  };

  const gatherCards = () => {
    if (hasGatheredCards.current) return;

    hasGatheredCards.current = true;
    setIsRotating(false);
    setPositions((prev) =>
      prev.map(() => ({
        top: "50%",
        left: "50%",
        rotate: 0,
      }))
    );
    setShuffleStep(3);
  };

  const onShuffleCard = async () => {
    if (isRotating) return;

    hasGatheredCards.current = false;
    const randomDeck = getRandomCardNo({ length: cardCnt });

    setIsRotating(false);
    setPositions(handleCardShufflePosition(cardCnt));

    // 처음에 카드 가운데
    setPositions((prev) =>
      prev.map(() => ({
        top: "50%",
        left: "50%",
        rotate: 0,
      }))
    );

    // 카드 퍼트리고
    setTimeout(() => {
      setPositions(handleCardShufflePosition(cardCnt));
    }, 2000);

    // 시계반대방향
    setTimeout(() => {
      setIsRotating(true);
      setShuffleStep(1);
    }, 5000);

    // 시계방향
    setTimeout(() => {
      setIsRotating(true);
      setShuffleStep(2);
    }, 10000);

    // 카드를 일자로 나열
    setTimeout(() => {
      setPositions((prev) =>
        prev.map((_, i) => ({
          top: "0%",
          left: `${1.2987 * i}%`,
          rotate: 0,
        }))
      );

      setShuffleStep(4);
    }, 16000);

    setTimeout(() => {
      setFinishedShuffle(true);
      setDeck(randomDeck);
    }, 18000);
  };

  useEffect(() => {
    if (cardCnt > 0) {
      setPositions(handleCardShufflePosition(cardCnt));
      onShuffleCard();
    }
  }, [cardCnt]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    const redirect = getReadingFlowRedirect(type, topic);
    if (redirect) router.replace(redirect);
  }, [mounted, router, topic, type]);

  useEffect(() => {
    if (!mounted || getReadingFlowRedirect(type, topic)) return;

    const onLoadData = async () => {
      const result = await getCardCount();
      setCardCnt(result);
    };

    onLoadData();
  }, [mounted, topic, type]);

  useEffect(() => {
    return () => {
      if (resultTimer.current) clearTimeout(resultTimer.current);
    };
  }, []);

  useResetData(handleResetCardProgress);

  return (
    <>
      {cardCnt > 0 ? (
        <>
          <InfoText finishedShuffle={finishedShuffle} />

          <TarotCardBoard
            isRotating={isRotating}
            positions={positions}
            cardCnt={cardCnt}
            onOrbitComplete={gatherCards}
            onCardRevealComplete={handleCardRevealComplete}
          />

          <PickCardBoard finishedShuffle={finishedShuffle} />

          <NumberPad
            finishedShuffle={finishedShuffle}
            deck={deck}
            selectionLocked={selectionLocked}
            onSelectionStarted={() => setSelectionLocked(true)}
          />
        </>
      ) : null}
    </>
  );
};

export default ShufflePage;
