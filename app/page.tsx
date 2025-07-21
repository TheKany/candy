"use client";

import {
  ImageBox,
  MenuList,
  ServiceTextBox,
  ServiceTitle,
} from "@/components/home/homeStyle";
import MenuButton from "@/components/home/MenuButton";
import { getTotalUsers, handleCountUsers } from "@/util/handleCountUsers";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import dynamic from "next/dynamic";

const AdBanner = dynamic(() => import("@/components/_common/AdBanner"), {
  ssr: false,
});

const Home = () => {
  const [totalUsers, setTotalUsers] = useState<number>(0);

  useEffect(() => {
    const intervalCount = setInterval(() => {
      handleCountUsers(window.location.pathname);
    }, 10000);

    return () => clearInterval(intervalCount);
  }, []);

  useEffect(() => {
    const loadTotal = async () => {
      const result = await getTotalUsers();
      setTotalUsers(result);
    };

    loadTotal();
  }, []);

  return (
    <>
      <TotalText style={{ fontSize: "14px", marginTop: "8px" }}>
        Total🤓 : {totalUsers}
      </TotalText>

      <ServiceTextBox>
        <ServiceTitle $fz={16}>달콤하게 점쳐보는</ServiceTitle>
        <ServiceTitle $fz={16}>당신의 운명</ServiceTitle>
        <ServiceTitle $fz={36}>타로타르트</ServiceTitle>
      </ServiceTextBox>
      <ImageBox>
        <Image src={"/main.png"} alt="메인이미지" width={250} height={250} />
      </ImageBox>
      <MenuList>
        {/* 원 오라클: title="한 입 타르트" subtitle="한 장으로 보는 운명" */}
        <MenuButton
          selectType={"one"}
          src="/cardBack.png"
          alt="한 장의 카드"
          width={30}
          height={52}
          title="한 입 타르트"
          subTitle="한 장으로 가볍게"
        />

        {/* 쓰리카드: title="타르트 시간세트" subtitle="과거-현재-미래" */}
        <MenuButton
          selectType={"three"}
          src="/second.png"
          alt="세 장의 카드"
          width={43}
          height={40}
          title="타르트 시간세트"
          subTitle="과거-현재-미래"
        />

        {/* 양자택일: title="선택 타르트" subtitle="Yes or No / 선택의 순간" */}
        {/* <MenuButton
          selectType={"Yn"}
          src="/third.png"
          alt="세 장의 카드"
          width={40}
          height={41}
          title="어떤 타르트를 먹을까?"
          subTitle="선택을 도와줘"
        /> */}
      </MenuList>

      {/* <AdBanner /> */}
    </>
  );
};

export default Home;

const TotalText = styled.p`
  color: #fff;
`;
