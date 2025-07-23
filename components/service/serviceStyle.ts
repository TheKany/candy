"use client";
import Link from "next/link";
import styled from "styled-components";

export const MainTitle = styled.p`
  font-size: 24px;
  color: #d4af37;
  text-align: center;
`;

export const QuestionBox = styled.div`
  margin-top: 16px;
  margin-bottom: 32px;
`;

export const Question = styled.p`
  color: #fff;
  font-weight: 500;
  font-size: 16px;
  padding: 4px 0;
  margin-bottom: 4px;
  text-align: center;
`;

export const BtnBox = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;

export const Answer = styled.button<{ $clicked: boolean }>`
  padding: 8px;
  border-radius: 16px;
  background-color: ${({ $clicked }) => ($clicked ? "#c57a17" : "#eadbc8")};
`;

export const LinkBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

export const ShuffleBtn = styled(Link)`
  width: 80%;
  background-color: #fff;
  padding: 16px 0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 900;
  text-align: center;
`;
