"use client";

import Wrapper from "@/components/_common/_Wrapper";
import MenuButton from "@/components/home/MenuButton";
import { getTotalUsers } from "@/util/handleCountUsers";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import styled from "styled-components";

const AdBanner = dynamic(() => import("@/components/_common/AdBanner"), {
  ssr: false,
});

const Home = () => {
  const [totalUsers, setTotalUsers] = useState<number>(0);

  useEffect(() => {
    const loadTotal = async () => {
      const result = await getTotalUsers();
      setTotalUsers(result);
    };

    loadTotal();
  }, []);

  return (
    <Wrapper>
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

        {/* 쓰리카드: title="타르트 세트" subtitle="세 장으로 깊게" */}
        {/* <MenuButton
          selectType={"three"}
          src="/second.png"
          alt="세 장의 카드"
          width={43}
          height={40}
          title="타르트 세트"
          subTitle="세 장으로 더 맛있게"
        /> */}
      </MenuList>

      {/* <AdBanner /> */}
    </Wrapper>
  );
};

export default Home;

const TotalText = styled.p`
  color: #fff;
`;

const ServiceTextBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const ImageBox = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
`;

const ServiceTitle = styled.p<{ $fz: number }>`
  font-size: ${({ $fz }) => `${$fz}px`};
  color: #d4af37;
  font-weight: 700;
`;

const MenuList = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  gap: 16px;
`;
