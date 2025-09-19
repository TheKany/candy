"use client";
import { useEffect, useState } from "react";
import { getRandomCardNo } from "@/util/getRandomCardNo";
import { handleCardShufflePosition } from "@/util/handleCardShufflePosition";
import { getCardCount } from "@/util/getCardData";

import NumberPad from "@/components/shuffle/NumberPad";
import TarotCardBoard from "@/components/shuffle/TarotCardBoard";
import InfoText from "@/components/shuffle/InfoText";
import PickCardBoard from "@/components/shuffle/PickCardBoard";
import { handleResetStore } from "@/util/handleResetStore";
import { useResetData } from "@/hooks/useResetData";
import { useShuffleTypeStore } from "@/store/useShuffleTypeStore";

type PositionProps = {
  top: string;
  left: string;
  rotate: number;
};

const ShufflePage = () => {
  const setShuffleStep = useShuffleTypeStore((state) => state.setShuffleStep);

  const [cardCnt, setCardCnt] = useState<number>(0);
  const [positions, setPositions] = useState<PositionProps[]>([]);
  const [isRotating, setIsRotating] = useState(false);
  const [finishedShuffle, setFinishedShuffle] = useState(false);
  const [deck, setDeck] = useState<number[]>([]);

  const onShuffleCard = async () => {
    if (isRotating) return;

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
      setPositions(handleCardShufflePosition(cardCnt));
      setShuffleStep(1);
    }, 5000);

    // 시계방향
    setTimeout(() => {
      setIsRotating(true);
      setPositions(handleCardShufflePosition(cardCnt));
      setShuffleStep(2);
    }, 10000);

    // 가운데로 모으기
    setTimeout(() => {
      setIsRotating(true);
      setPositions((prev) =>
        prev.map(() => ({
          top: "50%",
          left: "50%",
          rotate: 0,
        }))
      );

      setShuffleStep(3);
    }, 13000);

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

  useEffect(() => {
    const onLoadData = async () => {
      const result = await getCardCount();
      setCardCnt(result);
    };

    onLoadData();
  }, []);

  useResetData(handleResetStore);

  return (
    <>
      {cardCnt > 0 ? (
        <>
          <InfoText finishedShuffle={finishedShuffle} />

          <TarotCardBoard
            isRotating={isRotating}
            positions={positions}
            cardCnt={cardCnt}
          />

          <PickCardBoard finishedShuffle={finishedShuffle} />

          <NumberPad finishedShuffle={finishedShuffle} deck={deck} />
        </>
      ) : null}
    </>
  );
};

export default ShufflePage;
