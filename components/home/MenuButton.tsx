import React from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { TarotType, useTarotTypeStore } from "@/store/useTarotTypeStore";
import styled from "styled-components";

type Props = {
  selectType: TarotType;
  src: string;
  alt: string;
  width: number;
  height: number;
  title: string;
  subTitle: string;
};

const MenuButton = ({
  selectType,
  src,
  alt,
  width,
  height,
  title,
  subTitle,
}: Props) => {
  const router = useRouter();
  const setType = useTarotTypeStore((state) => state.setType);

  const onClickLinkMenu = (id: TarotType) => {
    setType(id);
    id === "one" ? router.push("/shuffle") : router.push("/service");
  };

  return (
    <MenuContainer onClick={() => onClickLinkMenu(selectType)}>
      <MenuBtnWrapper>
        <Image src={src} alt={alt} width={width} height={height} />
        <TextBox>
          <Title>{title}</Title> <SubTitle>- {subTitle} -</SubTitle>
        </TextBox>
      </MenuBtnWrapper>
    </MenuContainer>
  );
};

export default MenuButton;

const MenuContainer = styled.button`
  width: 90%;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 50px 100px -20px,
    rgba(0, 0, 0, 0.3) 0px 30px 60px -30px,
    rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset;
`;

const MenuBtnWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  padding: 16px;
  background-color: #eadbc8;
  border-radius: 8px;

  & img {
    position: absolute;
    left: 15%;
  }
`;

const TextBox = styled.p`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding-left: 16px;
  color: #121212;
  font-size: 500;
`;

const Title = styled.span`
  font-size: 16px;
  font-weight: 500;
`;

const SubTitle = styled.span`
  font-size: 12px;
  font-weight: 300;
`;
