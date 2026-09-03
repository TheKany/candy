"use client";

import { getTarotTopic } from "@/constants/tarotTopics";
import { useTarotTopicStore } from "@/store/useTarotTopicStore";
import { useUserPickNum } from "@/store/useUserPickNumStore";
import type { TarotReadingResult } from "@/types/tarotReadingTypes";
import { buildTarotResultPresentation } from "@/util/tarotResultPresentation";
import Image from "next/image";
import { useEffect, useState } from "react";
import styled from "styled-components";

const OneCardResult = () => {
  const pickedCards = useUserPickNum((state) => state.realCard);
  const topicId = useTarotTopicStore((state) => state.topic);
  const topic = getTarotTopic(topicId);
  const cardId = pickedCards[0];
  const [result, setResult] = useState<TarotReadingResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (cardId === undefined || !topicId) return;

    const controller = new AbortController();

    const loadReading = async () => {
      try {
        const params = new URLSearchParams({
          cardId: String(cardId),
          topicId,
          orientation: "upright",
        });
        const response = await fetch(`/api/tarotReading?${params}`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("reading request failed");

        setResult((await response.json()) as TarotReadingResult);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Tarot reading request failed:", error);
          setErrorMessage("카드의 메시지를 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
        }
      }
    };

    loadReading();
    return () => controller.abort();
  }, [cardId, topicId]);

  if (cardId === undefined || !topic) {
    return <StatusMessage>선택한 카드와 주제를 확인해주세요.</StatusMessage>;
  }

  if (errorMessage) return <StatusMessage>{errorMessage}</StatusMessage>;
  if (!result) return <StatusMessage>카드의 메시지를 펼치고 있어요.</StatusMessage>;

  const { card, reading, fallback } = result;
  const presentation = reading ? buildTarotResultPresentation(reading) : null;

  return (
    <ResultSection>
      <TopicLabel>선택한 주제 · {topic.title}</TopicLabel>

      <ConclusionBox>
        <span>그래서, 결론은</span>
        <p>{presentation?.conclusion ?? card.upright_one_line}</p>
      </ConclusionBox>

      <CardBox>
        <CardName>{card.name_ko}</CardName>
        <EnglishName>{card.name_en}</EnglishName>
        <Keywords>{card.upright_keywords.slice(0, 5).join(" · ")}</Keywords>
        <CardImage>
          <Image
            src={`/cards/card${card.card_id}.webp`}
            alt={`${card.name_ko} 타로 카드`}
            width={220}
            height={367}
            priority
          />
        </CardImage>
      </CardBox>

      {fallback || !reading || !presentation ? (
        <FallbackBox>
          <h2>카드가 전하는 흐름</h2>
          <p>지금의 상황과 맞닿는 부분부터 천천히 살펴보세요.</p>
        </FallbackBox>
      ) : (
        <ReadingBox>
          <ReadingHeader>
            <span>DETAIL READING</span>
            <h2>{presentation.headline}</h2>
          </ReadingHeader>

          <ReadingGrid>
            {presentation.details.map(([title, body]) => (
              <ReadingCard key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </ReadingCard>
            ))}
          </ReadingGrid>

          <AdviceBox>
            <span>마지막 조언</span>
            <h3>카드가 권하는 한 가지</h3>
            <p>{presentation.advice}</p>
            <ReflectionBox>
              <span>나에게 묻는 질문</span>
              <p>{presentation.reflectionQuestion}</p>
            </ReflectionBox>
          </AdviceBox>
        </ReadingBox>
      )}
    </ResultSection>
  );
};

export default OneCardResult;

const ResultSection = styled.section`
  width: 100%;
  min-width: 0;
`;

const StatusMessage = styled.p`
  width: 100%;
  margin: 40px 0;
  padding: 24px 16px;
  border-radius: 14px;
  background: #fff9e8;
  color: #294d40;
  text-align: center;
  line-height: 1.6;
`;

const TopicLabel = styled.p`
  width: fit-content;
  max-width: 100%;
  margin: 0 auto 18px;
  padding: 7px 13px;
  border: 1px solid #d8b85c;
  border-radius: 999px;
  color: #294d40;
  background: #fff9e8;
  font-size: clamp(0.76rem, 3.5vw, 0.84rem);
  font-weight: 700;
  text-align: center;
`;

const CardBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: clamp(20px, 7vw, 30px) clamp(12px, 5vw, 20px);
  border: 1px solid rgba(216, 184, 92, 0.55);
  border-radius: 18px;
  background: #f7f3e8;
  box-shadow: 0 8px 24px rgba(41, 77, 64, 0.1);
  text-align: center;
`;

const ConclusionBox = styled.section`
  width: 100%;
  margin-bottom: 12px;
  padding: clamp(22px, 7vw, 30px) clamp(16px, 6vw, 24px);
  border: 1px solid rgb(225 198 109 / 70%);
  border-radius: 18px;
  color: #fff8e5;
  background: linear-gradient(145deg, #294d40, #17382e);
  box-shadow: 0 10px 26px rgb(26 57 47 / 18%);

  span {
    display: block;
    margin-bottom: 9px;
    color: #e7ca70;
    font-size: 0.78rem;
    font-weight: 900;
    letter-spacing: 0.04em;
  }

  p {
    margin: 0;
    font-family: "NotoSerifKR", serif;
    font-size: clamp(1.08rem, 5.2vw, 1.4rem);
    font-weight: 800;
    line-height: 1.62;
    word-break: keep-all;
  }
`;

const CardName = styled.h1`
  margin: 0;
  color: #294d40;
  font-size: clamp(1.7rem, 9vw, 2.25rem);
`;

const EnglishName = styled.p`
  margin: 5px 0 12px;
  color: #6c7a6e;
  font-size: 0.86rem;
  font-style: italic;
`;

const Keywords = styled.p`
  max-width: 100%;
  margin: 0 0 18px;
  color: #7c6940;
  font-size: clamp(0.75rem, 3.4vw, 0.9rem);
  line-height: 1.55;
  overflow-wrap: anywhere;
`;

const CardImage = styled.div`
  width: min(220px, 82vw);

  img {
    display: block;
    width: 100%;
    height: auto;
    border-radius: 10px;
  }
`;

const ReadingBox = styled.div`
  width: 100%;
  margin-top: 22px;
`;

const ReadingHeader = styled.header`
  padding: clamp(22px, 7vw, 30px) clamp(16px, 6vw, 24px);
  border-radius: 18px;
  background: #294d40;
  color: #f8f1dc;

  span {
    display: block;
    color: #e1c66d;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  h2 {
    margin: 7px 0 14px;
    font-size: clamp(1.25rem, 6vw, 1.65rem);
    line-height: 1.35;
  }

`;

const ReadingGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-top: 10px;
`;

const ReadingCard = styled.article`
  min-width: 0;
  padding: 18px 16px;
  border: 1px solid rgba(216, 184, 92, 0.45);
  border-radius: 14px;
  background: #fffdf6;

  h3 {
    margin: 0 0 7px;
    color: #7c6331;
    font-size: 0.86rem;
  }

  p {
    margin: 0;
    color: #31463e;
    font-size: clamp(0.86rem, 3.7vw, 0.96rem);
    line-height: 1.72;
    overflow-wrap: anywhere;
  }
`;

const ReflectionBox = styled.div`
  margin-top: 18px;
  padding: 17px 15px;
  border-radius: 14px;
  background: rgb(255 255 255 / 58%);
  color: #294d40;

  span {
    font-size: 0.76rem;
    font-weight: 800;
  }

  p {
    margin: 8px 0 0;
    font-size: clamp(0.92rem, 4vw, 1.05rem);
    font-weight: 700;
    line-height: 1.65;
  }
`;

const AdviceBox = styled.section`
  margin-top: 12px;
  padding: 22px 17px;
  border: 1px solid #d8b85c;
  border-radius: 16px;
  color: #294d40;
  background: #fff2bb;

  & > span {
    color: #80662c;
    font-size: 0.76rem;
    font-weight: 900;
  }

  & > h3 {
    margin: 7px 0 9px;
    font-size: clamp(1.04rem, 4.5vw, 1.2rem);
  }

  & > p {
    margin: 0;
    font-size: clamp(0.9rem, 3.8vw, 1rem);
    line-height: 1.75;
  }
`;

const FallbackBox = styled.div`
  margin-top: 22px;
  padding: 24px 18px;
  border-radius: 16px;
  background: #294d40;
  color: #f8f1dc;

  h2 {
    margin: 0 0 12px;
    font-size: 1.2rem;
  }

  p {
    margin: 0 0 12px;
    line-height: 1.75;
  }

  span {
    color: #e1c66d;
    font-size: 0.82rem;
  }
`;
