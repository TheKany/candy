"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import React from "react";
import styled from "styled-components";

type Props = {
  children: React.ReactNode;
};

const Wrapper = ({ children }: Props) => {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
        style={{ minHeight: "100%" }}
      >
        <Box>{children}</Box>
      </motion.div>
    </AnimatePresence>
  );
};

export default Wrapper;

const Box = styled.div`
  min-height: 100%;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;
