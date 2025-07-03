"use client";

import React from "react";
import {
  MenuButton,
  MenuContainer,
  MenuList,
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
      <ServiceTitle>Tr: ㅌㄹ</ServiceTitle>
      <MenuList>
        {/* 원 오라클: title="진심을 듣다" subtitle="한 장의 메시지" */}
        <MenuButton onClick={() => onClickLinkMenu("one")}>
          <MenuContainer>
            <Image
              src={"/cardBack.png"}
              alt="한 장의 카드"
              width={30}
              height={52}
            />
            <TextBox>
              <Title>진심을 듣다.</Title>{" "}
              <SubTitle>- 한 장의 메시지 -</SubTitle>
            </TextBox>
          </MenuContainer>
        </MenuButton>
        {/* 쓰리카드: title="흐름을 읽다" subtitle="과거-현재-미래" */}
        <MenuButton onClick={() => onClickLinkMenu("three")}>
          <MenuContainer>
            <Image
              src={"/second.png"}
              alt="세 장의 카드"
              width={43}
              height={40}
            />
            <TextBox>
              <Title>흐름을 읽다.</Title> <SubTitle>- 시간의 흐름 -</SubTitle>
            </TextBox>
          </MenuContainer>
        </MenuButton>
        {/* 양자택일: title="길을 고르다" subtitle="Yes or No / 선택의 순간" */}
        <MenuButton onClick={() => onClickLinkMenu("Yn")}>
          <MenuContainer>
            <Image src={"/third.png"} alt="둘 중 하나" width={40} height={41} />
            <TextBox>
              <Title>길을 고르다.</Title> <SubTitle>- 선택의 순간 -</SubTitle>
            </TextBox>
          </MenuContainer>
        </MenuButton>
        {/* {step === 2 ? <TarotBoard /> : null} */}
      </MenuList>
    </>
  );
};

export default IntroBoard;
