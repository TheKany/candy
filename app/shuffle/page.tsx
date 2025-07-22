"use client";

import styled from "styled-components";
import { useEffect, useState } from "react";
import { useShuffleType } from "@/store/shuffleTypeStore";
import { getRandomCardNo } from "@/util/getRandomCardNo";
import { handleCardShufflePosition } from "@/util/handleCardShufflePosition";
import { getCardCount } from "@/util/getCardData";
import Wrapper from "@/components/_common/_Wrapper";
import { useRouter } from "next/navigation";
import NumberPad from "@/components/shuffle/NumberPad";
import TarotCardBoard from "@/components/shuffle/TarotCardBoard";
import InfoText from "@/components/shuffle/InfoText";
import PickCardBoard from "@/components/shuffle/PickCardBoard";
import { usePickCard } from "@/store/pickCardStore";
import { useTarotType } from "@/store/tarotTypeStore";
import { handleResetStore } from "@/util/handleResetStore";
import { useResetData } from "@/hooks/useResetData";

type PositionProps = {
  top: string;
  left: string;
  rotate: number;
};

const ShufflePage = () => {
  const router = useRouter();

  const { type } = useTarotType();
  const { pickedCardList } = usePickCard();
  const { setShuffleStep } = useShuffleType();

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

  useEffect(() => {
    setTimeout(() => {
      if (type === "one" && pickedCardList.length === 1) {
        router.replace("/result");
      } else if (pickedCardList.length === 3) {
        router.replace("/result");
      }
    }, 1000);
  }, [pickedCardList]);

  useResetData(handleResetStore);

  return (
    <Container>
      {cardCnt > 0 ? (
        <Wrapper>
          <InfoText finishedShuffle={finishedShuffle} />

          <TarotCardBoard
            isRotating={isRotating}
            positions={positions}
            cardCnt={cardCnt}
          />

          <PickCardBoard finishedShuffle={finishedShuffle} />

          <NumberPad finishedShuffle={finishedShuffle} deck={deck} />
        </Wrapper>
      ) : null}
    </Container>
  );
};

export default ShufflePage;

const Container = styled.div`
  width: 100%;
  height: 90vh;
  position: relative;
`;
