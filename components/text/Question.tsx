"use client";

import React from "react";
import styled from "styled-components";

type Props = {
  text: string;
};

const Question = ({ text }: Props) => {
  return <Title>{text}</Title>;
};

export default Question;

const Title = styled.p`
  color: #fff;
  font-size: 24px;
  font-weight: 700;
  text-align: center;
`;
