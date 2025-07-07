"use client";

import React from "react";
import {
  ImageBox,
  MenuButton,
  MenuContainer,
  MenuList,
  ServiceTextBox,
  ServiceTitle,
  SubTitle,
  TextBox,
  Title,
} from "./IntroStyles";
import Image from "next/image";
import { TarotType, useTarotType } from "@/store/tarotTypeStore";
import { useRouter } from "next/navigation";

const IntroBoard = () => {
  const router = useRouter();
  const { setType } = useTarotType();
  const onClickLinkMenu = (id: TarotType) => {
    setType(id);
    router.push("/service");
  };

  return (
    <>
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
        <MenuButton onClick={() => onClickLinkMenu("one")}>
          <MenuContainer>
            <Image
              src={"/cardBack.png"}
              alt="한 장의 카드"
              width={30}
              height={52}
            />
            <TextBox>
              <Title>한 입 타르트</Title>{" "}
              <SubTitle>- 한 장으로 보는 운명 -</SubTitle>
            </TextBox>
          </MenuContainer>
        </MenuButton>
        {/* 쓰리카드: title="타르트 시간세트" subtitle="과거-현재-미래" */}
        <MenuButton onClick={() => onClickLinkMenu("three")}>
          <MenuContainer>
            <Image
              src={"/second.png"}
              alt="세 장의 카드"
              width={43}
              height={40}
            />
            <TextBox>
              <Title>타르트 시간세트</Title>{" "}
              <SubTitle>- 과거-현재-미래 -</SubTitle>
            </TextBox>
          </MenuContainer>
        </MenuButton>
        {/* 양자택일: title="선택 타르트" subtitle="Yes or No / 선택의 순간" */}
        <MenuButton onClick={() => onClickLinkMenu("Yn")}>
          <MenuContainer>
            <Image src={"/third.png"} alt="둘 중 하나" width={40} height={41} />
            <TextBox>
              <Title>선택 타르트</Title>{" "}
              <SubTitle>- Yes or No / 선택의 순간 -</SubTitle>
            </TextBox>
          </MenuContainer>
        </MenuButton>
        {/* {step === 2 ? <TarotBoard /> : null} */}
      </MenuList>
    </>
  );
};

export default IntroBoard;
