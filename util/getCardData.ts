import { TAROT_CARD_COUNT } from "../constants/tarot.ts";

// total card count
export const getCardCount = async (): Promise<number> => TAROT_CARD_COUNT;
