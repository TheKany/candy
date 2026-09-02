"use client";

import { getTarotTopic } from "@/constants/tarotTopics";
import { useTarotTopicStore } from "@/store/useTarotTopicStore";
import { useUserPickNum } from "@/store/useUserPickNumStore";
import type { TarotReadingResult } from "@/types/tarotReadingTypes";
import Image from "next/image";
import { useEffect, useState } from "react";
import styled from "styled-components";

const readingSections = [
  ["감정의 층위", "emotional_layer"],
  ["숨은 맥락", "hidden_context"],
  ["마주할 과제", "challenge"],
  ["열려 있는 기회", "opportunity"],
  ["가까운 흐름", "near_future"],
  ["카드의 조언", "advice"],
] as const;

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

  return (
    <ResultSection>
      <TopicLabel>선택한 주제 · {topic.title}</TopicLabel>

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

      {fallback || !reading ? (
        <FallbackBox>
          <h2>카드가 전하는 한마디</h2>
          <p>{card.upright_one_line}</p>
          <span>지금의 상황과 맞닿는 부분부터 천천히 살펴보세요.</span>
        </FallbackBox>
      ) : (
        <ReadingBox>
          <ReadingHeader>
            <span>오늘의 리딩</span>
            <h2>{reading.headline}</h2>
            <p>{reading.core_message}</p>
          </ReadingHeader>

          <ReadingGrid>
            {readingSections.map(([title, field]) => (
              <ReadingCard key={field}>
                <h3>{title}</h3>
                <p>{reading[field]}</p>
              </ReadingCard>
            ))}
          </ReadingGrid>

          <ReflectionBox>
            <span>나에게 묻는 질문</span>
            <p>{reading.reflection_question}</p>
          </ReflectionBox>
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

  p {
    margin: 0;
    font-size: clamp(0.9rem, 3.8vw, 1rem);
    line-height: 1.8;
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
  margin-top: 10px;
  padding: 20px 16px;
  border-radius: 14px;
  background: #fff2bb;
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
