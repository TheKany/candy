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
  max-width: 480px;
  min-width: 280px;
  min-height: 100dvh;
  position: relative;
  margin: 0 auto;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: #0c3427;
`;
