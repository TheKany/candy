import type { TarotTypeId, TarotTypeOption } from "@/constants/tarotTypes";
import styled, { keyframes } from "styled-components";

type TarotTypeCardProps = {
  option: TarotTypeOption;
  onSelect: (id: TarotTypeId) => void;
  selected?: boolean;
  disabled?: boolean;
};

export default function TarotTypeCard({ option, onSelect, selected = false, disabled = false }: TarotTypeCardProps) {
  return (
    <CardButton
      type="button"
      $selected={selected}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`${option.title}, ${option.subtitle}${option.available ? "" : ", 준비 중"}`}
      onClick={() => onSelect(option.id)}
    >
      <Symbol aria-hidden>{option.symbol}</Symbol>
      <Copy>
        <Title>{option.title}</Title>
        <Subtitle>{option.subtitle}</Subtitle>
      </Copy>
      {option.available ? (
        <SelectionMark $selected={selected} aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" /></svg>
        </SelectionMark>
      ) : (
        <Badge aria-hidden>준비 중</Badge>
      )}
    </CardButton>
  );
}

const CardButton = styled.button<{ $selected: boolean }>`
  display: grid;
  width: 100%;
  min-width: 0;
  min-height: 88px;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  align-items: center;
  column-gap: 8px;
  padding: 14px 4px;
  border: 0;
  border-bottom: 1px solid #b5a17b40;
  border-radius: 0;
  color: #244636;
  background: ${({ $selected }) => $selected ? "#dce4cc" : "transparent"};
  cursor: pointer;
  text-align: left;
  transition: background 180ms ease;
  &:last-child { border-bottom: 0; }

  &:hover:not(:disabled) {
    background: #dfd3b54a;
  }
  &:disabled { cursor: default; opacity: 1; }

  &:focus-visible {
    outline: 2px solid #476b50;
    outline-offset: -3px;
  }
`;

const Symbol = styled.span`
  display: grid;
  width: 28px;
  height: 44px;
  place-items: center;
  color: #9a7a43;
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
  color: #244636;
  font-size: clamp(1rem, 4.6vw, 1.12rem);
  font-weight: 900;
  line-height: 1.25;
  word-break: keep-all;
`;

const Subtitle = styled.span`
  color: #747762;
  font-size: 0.78rem;
  line-height: 1.6;
  word-break: keep-all;
`;

const drawCheck = keyframes`
  from { stroke-dashoffset: 28; }
  to { stroke-dashoffset: 0; }
`;

const SelectionMark = styled.span<{ $selected: boolean }>`
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  margin: 0 3px;
  border: 1px solid ${({ $selected }) => $selected ? "#365e44" : "#a7a48a"};
  border-radius: 5px;
  background: ${({ $selected }) => $selected ? "#365e44" : "#fffaf040"};
  transition: background 180ms ease, border-color 180ms ease;
  svg { width: 22px; height: 22px; fill: none; stroke: #fff8e9; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; visibility: ${({ $selected }) => $selected ? "visible" : "hidden"}; }
  path { stroke-dasharray: 28; stroke-dashoffset: ${({ $selected }) => $selected ? 0 : 28}; animation: ${({ $selected }) => $selected ? drawCheck : "none"} 240ms ease-out both; }
  @media (prefers-reduced-motion: reduce) { &, path { animation: none; transition: none; } }
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
