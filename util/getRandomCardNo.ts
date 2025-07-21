import { TarotType } from "@/store/tarotTypeStore";

type Props = {
  length: number;
};

// 카드 덱 나누기
const splitCardGroups = (deck: number[], groupCnt: number) => {
  const groups: number[][] = Array.from({ length: groupCnt }, () => []);
  deck.forEach((card, i) => {
    groups[i % groupCnt].push(card);
  });
  return groups;
};

// 반시계 방향
const rotateLeftDeck = (groups: number[][]): number[][] => {
  return groups.map((group, i, arr) => {
    const fromIdx = (i + 1) % arr.length;
    const takeCount = Math.floor(Math.random() * (arr[fromIdx].length + 1));
    const taken = arr[fromIdx].splice(0, takeCount);
    return [...group, ...taken];
  });
};

// 시계 방향
const rotateRightDeck = (groups: number[][]): number[][] => {
  return groups.map((group, i, arr) => {
    const fromIdx = (i - 1 + arr.length) % arr.length;
    const takeCount = Math.floor(Math.random() * (arr[fromIdx].length + 1));
    const taken = arr[fromIdx].splice(0, takeCount);
    return [...group, ...taken];
  });
};

// 카드 회전
const shiftArray = (arr: number[], offset: number): number[] => {
  const len = arr.length;
  const realOffset = ((offset % len) + len) % len;
  return [...arr.slice(realOffset), ...arr.slice(0, realOffset)];
};

export const getRandomCardNo = ({ length }: Props) => {
  console.log(length);
  let cardDeck = Array.from({ length }, (_, idx) => idx);

  // 1. 랜덤으로 카드를 퍼트린다 (셔플)
  for (let i = cardDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cardDeck[i], cardDeck[j]] = [cardDeck[j], cardDeck[i]];
  }

  // 2. 덱을 n개의 그룹으로 나눈다
  const cardGroup = Math.floor(Math.random() * 4) + 3;
  let randomDeck = splitCardGroups(cardDeck, cardGroup);

  setTimeout(() => {
    console.log("🟡 Step 1 - 카드 퍼트리기:", cardDeck);
    console.log(`🟠 Step 2 - ${cardGroup}개 그룹 나눔:`, randomDeck);
  }, 2000);

  // 3. 반시계 방향 넘기기
  setTimeout(() => {
    randomDeck = rotateLeftDeck(randomDeck);
    console.log("🔵 Step 3 - 반시계 방향 섞기:", randomDeck);
  }, 5000);

  // 4. 시계 방향 넘기기
  setTimeout(() => {
    randomDeck = rotateRightDeck(randomDeck);
    console.log("🟢 Step 4 - 시계 방향 섞기:", randomDeck);
  }, 10000);

  // 5. 하나의 배열로 반환
  return randomDeck.flat();
};
