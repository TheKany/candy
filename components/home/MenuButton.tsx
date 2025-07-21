import React from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { TarotType, useTarotType } from "@/store/tarotTypeStore";
import {
  MenuBtnWrapper,
  MenuContainer,
  SubTitle,
  TextBox,
  Title,
} from "./homeStyle";

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
  const { setType } = useTarotType();
  const onClickLinkMenu = (id: TarotType) => {
    setType(id);
    router.push("/service");
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
