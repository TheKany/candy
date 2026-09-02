import type { TarotTypeId, TarotTypeOption } from "@/constants/tarotTypes";
import styled from "styled-components";

type TarotTypeCardProps = {
  option: TarotTypeOption;
  onSelect: (id: TarotTypeId) => void;
};

export default function TarotTypeCard({ option, onSelect }: TarotTypeCardProps) {
  return (
    <CardButton
      type="button"
      aria-label={`${option.title}, ${option.subtitle}${option.available ? "" : ", 준비 중"}`}
      onClick={() => onSelect(option.id)}
    >
      <Symbol aria-hidden>{option.symbol}</Symbol>
      <Copy>
        <Title>{option.title}</Title>
        <Subtitle>— {option.subtitle} —</Subtitle>
      </Copy>
      {option.available ? (
        <Arrow aria-hidden>→</Arrow>
      ) : (
        <Badge aria-hidden>준비 중</Badge>
      )}
    </CardButton>
  );
}

const CardButton = styled.button`
  display: grid;
  width: 100%;
  min-width: 0;
  min-height: 88px;
  grid-template-columns: 28px minmax(150px, 1fr) auto;
  align-items: center;
  column-gap: 8px;
  padding: 8px;
  border: 1px solid rgb(242 206 114 / 55%);
  border-radius: 17px;
  color: #fff6dc;
  background: linear-gradient(135deg, rgb(21 69 52 / 92%), rgb(9 43 33 / 94%));
  box-shadow: 0 10px 22px rgb(0 0 0 / 18%), inset 0 1px 0 rgb(255 247 223 / 8%);
  cursor: pointer;
  text-align: left;
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;

  &:hover {
    border-color: #f2ce72;
    background: linear-gradient(135deg, #19533d, #0b392c);
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 3px solid #fff6dc;
    outline-offset: -3px;
  }
`;

const Symbol = styled.span`
  display: grid;
  width: 28px;
  height: 44px;
  place-items: center;
  color: #f2ce72;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.65rem;
  line-height: 1;
`;

const Copy = styled.span`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.span`
  color: #fff6dc;
  font-size: clamp(1rem, 4.6vw, 1.12rem);
  font-weight: 900;
  line-height: 1.25;
  word-break: keep-all;
`;

const Subtitle = styled.span`
  color: rgb(255 247 223 / 76%);
  font-size: 0.78rem;
  line-height: 1.3;
  word-break: keep-all;
`;

const Arrow = styled.span`
  padding: 0 6px;
  color: #f2ce72;
  font-size: 1.4rem;
  font-weight: 700;
`;

const Badge = styled.span`
  display: inline-flex;
  min-height: 28px;
  align-items: center;
  justify-content: center;
  padding: 0 7px;
  border: 1px solid rgb(242 206 114 / 48%);
  border-radius: 999px;
  color: #f8dda0;
  background: rgb(6 27 21 / 52%);
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
`;
