import { handleCardCount, handlePickCard } from "./handleCardData"

// total card count
export const getCardCount = async() => {
  const count = await handleCardCount()

  return count
}

// pick card 
export const getCardPick = async(cardNo: number[] ) => {
  const pickCardList = await handlePickCard([...cardNo])

  return pickCardList
}
