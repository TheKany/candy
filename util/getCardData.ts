import { handleCardCount } from "./handleCardData";

// total card count
export const getCardCount = async () => {
  const count = await handleCardCount();

  return count;
};
