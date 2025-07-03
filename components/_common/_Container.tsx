"use client";

import React from "react";
import styled from "styled-components";
import Wrapper from "./_Wrapper";

type Props = {
  children: React.ReactNode;
};

const Container = ({ children }: Props) => {
  return (
    <Con>
      <Wrapper>{children}</Wrapper>
    </Con>
  );
};

export default Container;

const Con = styled.div`
  width: 100%;
  min-width: 280px;
  height: 100vh;
  max-height: 1200px;
  background-color: #193854;
  position: relative;
  overflow: hidden;

  padding: 24px 8px;

  @media (max-height: 600px) {
    width: 600px;
    height: 1200px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;
