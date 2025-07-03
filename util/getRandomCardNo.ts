import { TarotType } from "@/store/tarotTypeStore";

type Props = {
  length: number
  pickWay: 'top' | 'bot' | null
  type: TarotType
}

export const getRandomCardNo = ({length, pickWay, type}: Props) => {
  let cardDeck = Array.from({ length }, (_, i) => i);
  const DECK_CHUNK = 4;

  for (let r = 0; r < DECK_CHUNK; r++) {
    const chunks: number[][] = [];
    let i = 0;

    // 1. 랜덤한 덩어리로 자르기
    while (i < cardDeck.length) {
      const chunkSize = Math.floor(Math.random() * 7) + 3;
      const chunk = cardDeck.slice(i, i + chunkSize);

      // 1-1. 덩어리 내부도 셔플
      for (let k = chunk.length - 1; k > 0; k--) {
        const j = Math.floor(Math.random() * (k + 1));
        [chunk[k], chunk[j]] = [chunk[j], chunk[k]];
      }

      chunks.push(chunk);
      i += chunkSize;
    }

    // 2. 덩어리 순서를 다시 셔플
    for (let k = chunks.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [chunks[k], chunks[j]] = [chunks[j], chunks[k]];
    }

    // 3. 다시 병합
    cardDeck = chunks.flat();
  }

  // 필요한 카드 번호 추출 number[]
   if (type === "one") {
    return [pickWay === "top" ? cardDeck[0] : cardDeck[length - 1]];
  } else {
    return pickWay === "top"
      ? [cardDeck[0], cardDeck[1], cardDeck[2]]
      : [cardDeck[length - 1], cardDeck[length - 2], cardDeck[length - 3]];
  }

};
