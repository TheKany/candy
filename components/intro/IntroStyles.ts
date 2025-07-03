import styled from "styled-components";

export const ServiceTitle = styled.h1`
  color: aliceblue;
`

export const MenuList = styled.div`
  width: 100%;

  position: absolute;
  top: 60%;
  left: 50%;
  transform: translate(-50%, -50%);

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  gap: 16px;
`;

export const MenuButton = styled.button`
  width: 90%;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset;
  `;

export const MenuContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  padding: 16px;
  background-color:rgb(50, 79, 104);
  border-radius: 8px;

  & img {
    position: absolute;
    left: 20%;
  }
`;

export const TextBox = styled.p`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding-left: 16px;
  color: #fff;
`;

export const Title = styled.span`
  font-size: 16px;
  font-weight: 500;
`;

export const SubTitle = styled.span`
  font-size: 12px;
  font-weight: 300;
`;
