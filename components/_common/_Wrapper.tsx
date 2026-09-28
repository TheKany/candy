"use client";

import React from "react";
import styled from "styled-components";

type Props = {
  children: React.ReactNode;
};

const Wrapper = ({ children }: Props) => {
  return <Box>{children}</Box>;
};

export default Wrapper;

const Box = styled.div`
  min-height: 100%;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;
